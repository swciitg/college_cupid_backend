// const { authenticateWSToken } = require("../../middlewares/jwtAuthHandler.js");
const Reply = require("../../models/Reply.js");
const { POOL } = require("./constants.js");
const crypto = require("crypto");
const BlockedUsersFromApp = require("../../models/BlockedFromApp.js");
const { 
  addToPool, 
  removeFromPool, 
  pub, 
  sub, 
  redis 
} = require("./redis.js");

// Map to store local WebSocket connections: socketId -> ws
const localSockets = new Map();

// Subscribe to broadcast channel
sub.on("message", (channel, message) => {
  if (channel === "socket:broadcast") {
    const { targetSocketId, event, data } = JSON.parse(message);
    
    // Check if the target socket is connected to this instance
    const ws = localSockets.get(targetSocketId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ event, data }));
    }
  }
});

exports.socketHandlers = (wss) => {
  wss.on("connection", (ws, req) => {
    ws.id = crypto.randomUUID();
    localSockets.set(ws.id, ws);

    ws.on("message", async (raw) => {
      let parsed;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const { event, data } = parsed;

      if (event === "join_pool") {
        const user = data;
        user.room = null;
        user.chatStarted = null;

        // Store user in Redis
        const genderKey = user.gender === 0 ? "boys" : "girls";
        await addToPool(genderKey, ws.id, user);
      }

      if (event === "chat_message") {
        const { roomId, message } = data;
        
        // Get room members from Redis
        const roomMembers = await redis.smembers(`room:${roomId}:members`);
        
        // Broadcast to all members except sender
        for (const memberId of roomMembers) {
          if (memberId !== ws.id) {
            // Publish to Redis to reach the user wherever they are connected
            pub.publish("socket:broadcast", JSON.stringify({
              targetSocketId: memberId,
              event: "chat_message",
              data: message
            }));
          }
        }
      }

      if (event === "my_response") {
        const { roomId, answer } = data;
        
        // Check if already responded
        const hasResponded = await redis.sismember(`room:${roomId}:responded`, ws.id);
        if (hasResponded) return;

        // Store response
        await redis.sadd(`room:${roomId}:responded`, ws.id);
        await redis.hset(`room:${roomId}:answers`, ws.id, answer);

        const isYes = answer.toLowerCase() === "yes";
        
        // Update match status (optimistic locking or atomic operations would be better, but simple get/set for MVP)
        // We can use a hash field 'isMatch' initialized to 'true' (string)
        // If anyone says no, we set it to 'false'
        
        if (!isYes) {
           await redis.set(`room:${roomId}:isMatch`, "false");
        }

        const responseCount = await redis.scard(`room:${roomId}:responded`);

        if (responseCount === 2) {
            // Both answered
            const membersDetailsStr = await redis.get(`room:${roomId}:details`);
            const membersDetails = JSON.parse(membersDetailsStr || "[]");
            const isMatchStr = await redis.get(`room:${roomId}:isMatch`);
            const isMatch = isMatchStr !== "false"; // default true unless set to false

            const [u1, u2] = membersDetails; 
            // Note: membersDetails order is preserved from creation
            
            const payload = isMatch
            ? [u2.user.email, u1.user.email]
            : [null, null];

            // Notify U1
            pub.publish("socket:broadcast", JSON.stringify({
                targetSocketId: u1.socketId,
                event: "partner_response",
                data: payload[0]
            }));

            // Notify U2
            pub.publish("socket:broadcast", JSON.stringify({
                targetSocketId: u2.socketId,
                event: "partner_response",
                data: payload[1]
            }));

            // Close chat for both
            membersDetails.forEach((m) => {
                pub.publish("socket:broadcast", JSON.stringify({
                    targetSocketId: m.socketId,
                    event: "chat_closed"
                }));
            });

            if (payload[0] && payload[1]) {
                Reply.create([
                  {
                    senderEmail: payload[0],
                    receiverEmail: payload[1],
                    replyContent: `You found a Match in Blind-dating!`,
                    entityType: "BLIND_DATING_MATCH",
                    entitySerial: 0,
                  },
                  {
                    senderEmail: payload[1],
                    receiverEmail: payload[0],
                    replyContent: `You found a Match in Blind-dating!`,
                    entityType: "BLIND_DATING_MATCH",
                    entitySerial: 0,
                  },
                ]).catch((error) => {
                  console.log(
                    "THE SPEED DATING PAIR WHERE NOT UPDATED IN DATABASE DUE TO INSERT FAIL",
                  );
                });
            }
            
            // Cleanup room data
            await redis.del(
                `room:${roomId}:members`, 
                `room:${roomId}:details`, 
                `room:${roomId}:responded`, 
                `room:${roomId}:answers`,
                `room:${roomId}:isMatch`
            );
        }
      }

      if (event === "report") {
        const { reportedEmail, roomId } = data;
        
        // We might not have roomId in payload sometimes based on client? 
        // Based on original code it tries to find room.
        // With Redis, searching all rooms is expensive. We should rely on client sending roomId.
        // If roomId is missing, we can't easily find it without an index.
        // Assuming client sends roomId or we skip complex search for MVP.
        
        if (roomId) {
            const membersDetailsStr = await redis.get(`room:${roomId}:details`);
            if (membersDetailsStr) {
                 const membersDetails = JSON.parse(membersDetailsStr);
                 const reporter = membersDetails.find(u => u.user.email !== reportedEmail);
                 
                 if (reporter) {
                     const blockEmail = reporter.user.email;
                     try {
                        let doc = await BlockedUsersFromApp.findOne({email: blockEmail});
                        if (!doc) {
                          doc = await BlockedUsersFromApp.create({email: blockEmail, count: 1, isPermanent: false});
                        } else {
                          doc.count += 1;
                          if (doc.count > 2) {
                            doc.isPermanent = true;
                          }
                          await doc.save();
                        }
                        console.log(`Successfully blocked ${blockEmail}. Count: ${doc.count}`);
                      } catch (error) {
                        console.log("error in reporting user: ", error);
                      }
                 }
            }
        }
      }

      if (event === "leave") {
        await cleanup(ws);
      }
    });

    ws.on("close", async () => {
      localSockets.delete(ws.id);
      await cleanup(ws, "partner_disconnected");
    });
  });
};

async function cleanup(ws, eventName = "partner_left") {
  const user = await removeFromPool(ws.id);
  
  // If user was in a room, notify partner
  // We need to know which room the user was in.
  // In original code, we iterated all rooms.
  // In Redis, we should strictly store socketId -> roomId mapping or rely on room members.
  // For MVP, if we don't store socket->room map, we can't easily notify partner on disconnect 
  // unless we stored it in the user object or a separate key.
  
  // Let's check if we can retrieve roomId from the user object we just retrieved?
  // The 'user' object from addToPool might be stale if roomId was updated there?
  // Actually matchmaker updates user.room. But we only update Redis key `user:{socketId}` if we explicitly do so.
  
  // Better approach: When matching, set a key `socket:{id}:room` -> roomId
  const roomId = await redis.get(`socket:${ws.id}:room`);
  
  if (roomId) {
      const roomMembers = await redis.smembers(`room:${roomId}:members`);
      for (const memberId of roomMembers) {
          if (memberId !== ws.id) {
              pub.publish("socket:broadcast", JSON.stringify({
                  targetSocketId: memberId,
                  event: eventName
              }));
          }
      }
      
      // Cleanup room
       await redis.del(
            `room:${roomId}:members`, 
            `room:${roomId}:details`, 
            `room:${roomId}:responded`, 
            `room:${roomId}:answers`,
            `room:${roomId}:isMatch`,
            `socket:${ws.id}:room` // Clean my room ptr
        );
        // We should also clean partner's room ptr? 
        // Ideally yes, but if they are still connected, they might wonder why room is gone.
        // But the chat is effectively over.
  }
}
