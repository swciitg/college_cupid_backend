// const { authenticateWSToken } = require("../../middlewares/jwtAuthHandler.js");
const Reply = require("../../models/Reply.js");
const { boys, girls, rooms, POOL } = require("./constants.js");
const crypto = require("crypto");
const BlockedUsersFromApp = require("../../models/BlockedFromApp.js");

// Broadcast stats to all users in pool every 2 seconds
const STATS_POLL_INTERVAL = 2000;
let statsInterval = null;

function broadcastPoolStats(wss) {
  const boysCount = boys.length;
  const girlsCount = girls.length;
  const totalRooms = Object.keys(rooms).length;
  
  const statsMessage = JSON.stringify({
    event: "pool_stats",
    data: { boysCount, girlsCount, totalRooms },
  });

  boys.forEach(({ ws }) => {
    if (ws.readyState === 1) {
      ws.send(statsMessage);
    }
  });
  
  girls.forEach(({ ws }) => {
    if (ws.readyState === 1) {
      ws.send(statsMessage);
    }
  });
}

exports.socketHandlers = (wss) => {
  // Start polling if not already started
  if (!statsInterval) {
    statsInterval = setInterval(() => {
      broadcastPoolStats(wss);
    }, STATS_POLL_INTERVAL);
  }

  wss.on("connection", (ws, req) => {
    // try {
    //     const decoded = authenticateWSToken(req);
    //     ws.email = decoded.email;
    // } catch (err) {
    //     ws.close(1008, "Unauthorized");
    //     return;
    // }

    ws.id = crypto.randomUUID();
    ws.rooms = new Set();

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

        ws.rooms.add(POOL);

        if (user.gender === 0) {
          boys.push({ socketId: ws.id, user, ws });
        } else {
          girls.push({ socketId: ws.id, user, ws });
        }

        console.log("Joined ", user.email);
        // Stats will be sent via polling interval
        // console.log("BOYS:" , boys)
        // console.log("GIRLS : " , girls)
      }

      if (event === "chat_message") {
        const { roomId, message } = data;
        const room = rooms[roomId];
        if (!room || !room.members.includes(ws.id)) return;

        console.log(message);

        room.members.forEach((id) => {
          if (id !== ws.id) {
            const peer = room.membersDetails.find((m) => m.socketId === id);
            peer?.ws.send(
              JSON.stringify({
                event: "chat_message",
                data: message,
              }),
            );
          }
        });
      }

      if (event === "my_response") {
        const { roomId, answer } = data;
        const room = rooms[roomId];
        if (!room) return;

        if (room.responses.find((r) => r.socketId === ws.id)) return;
        // console.log(answer)

        const isYes = answer.toLowerCase() === "yes";
        if (room.isMatch === undefined) room.isMatch = isYes;
        else room.isMatch = room.isMatch && isYes;

        room.responses.push({ socketId: ws.id, answer });

        if (room.responses.length === 2) {
          const [u1, u2] = room.membersDetails;

          const payload = room.isMatch
            ? [u2.user.email, u1.user.email]
            : [null, null];

          u1.ws.send(
            JSON.stringify({ event: "partner_response", data: payload[0] }),
          );
          u2.ws.send(
            JSON.stringify({ event: "partner_response", data: payload[1] }),
          );

          room.membersDetails.forEach((m) => {
            console.log("CHAT CLOSED FOR ", roomId);
            m.ws.send(JSON.stringify({ event: "chat_closed" }));
          });

          clearTimeout(room.timer);

          console.log(payload[0] && payload[1]);

          if (payload[0] && payload[1]) {

            console.log('MATCH in Blind-dating')
            console.log(payload[0])
            console.log(payload[1])

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

            console.log("Updates sent")
          }

          delete rooms[roomId];
        }
      }

      if (event === "report") {
        const { reportedEmail } = data;
        try {
          let doc = await BlockedUsersFromApp.findOne();
          if (!doc) {
            doc = await BlockedUsersFromApp.create({ blockedUsers: [] });
          }
          let user = doc.blockedUsers.find((u) => u.email === reportedEmail);
          if (!user) {
            doc.blockedUsers.push({
              email: reportedEmail,
              count: 1,
              isPermanent: false,
            });
          } else {
            user.count += 1;
            if (user.count > 2) {
              user.isPermanent = true;
            }
          }
          await doc.save();
        } catch (error) {
          console.log("error in reporting user: ", error);
        }
      }

      if (event === "leave") {
        cleanup(ws, wss, "partner_left");
      }
    });

    ws.on("close", () => {
      console.log("DISCONNECTED");
      cleanup(ws, wss, "partner_disconnected");
    });
  });
};

function cleanup(ws, wss, eventName) {
  let i = boys.findIndex((b) => b.socketId === ws.id);
  if (i !== -1) boys.splice(i, 1);

  i = girls.findIndex((g) => g.socketId === ws.id);
  if (i !== -1) girls.splice(i, 1);

  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (room.members.includes(ws.id)) {
      room.membersDetails.forEach((m) => {
        if (m.socketId !== ws.id) {
          m.ws.send(JSON.stringify({ event: eventName }));
        }
      });
      clearTimeout(room.timer);
      delete rooms[roomId];
      break;
    }
  }
}
