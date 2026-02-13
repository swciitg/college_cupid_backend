const { CHAT_TIME, MIN_SCORE, MATCH_INTERVAL , incrementMatches } = require("./constants.js")
const { randomRoomId, getQuestions, calcScore } = require("../../utils/socket.js");
const { getPoolUsers, acquireLock, redis, pub } = require("./redis.js");

exports.matchMaking = (wss) => {
  setInterval(async () => {
    // 1. Acquire Lock
    const locked = await acquireLock("lock:matchmaking", MATCH_INTERVAL - 500);
    if (!locked) return; // Another instance is handling matchmaking

    // 2. Fetch State
    const boys = await getPoolUsers("boys");
    const girls = await getPoolUsers("girls");

    if (boys.length < 1 || girls.length < 1) return;

    let scores = [];
    for (let i = 0; i < boys.length; i++) {
      for (let j = 0; j < girls.length; j++) {
        scores.push({
          score: calcScore(boys[i].user, girls[j].user),
          bi: i,
          gi: j
        });
      }
    }

    scores.sort((a, b) => b.score - a.score);

    const usedBoys = new Set();
    const usedGirls = new Set();
    const pairs = [];

    for (const s of scores) {
      if (usedBoys.has(s.bi) || usedGirls.has(s.gi) || s.score < MIN_SCORE) continue;
      usedBoys.add(s.bi);
      usedGirls.add(s.gi);
      pairs.push({ boy: boys[s.bi], girl: girls[s.gi] });

      incrementMatches();
    }

    // 3. Update State (Remove matched users from pool)
    const pipeline = redis.pipeline();
    
    pairs.forEach(({ boy, girl }) => {
        pipeline.srem("pool:boys", boy.socketId);
        pipeline.srem("pool:girls", girl.socketId);
    });
    
    await pipeline.exec();


    // 4. Create Rooms and Notify
    for (const { boy, girl } of pairs) {
      const roomId = randomRoomId();

      // Store Room Data in Redis
      await redis.sadd(`room:${roomId}:members`, boy.socketId, girl.socketId);
      await redis.set(`room:${roomId}:details`, JSON.stringify([boy, girl]));
      // Map socket to room for quick lookup on disconnect
      await redis.set(`socket:${boy.socketId}:room`, roomId);
      await redis.set(`socket:${girl.socketId}:room`, roomId);

      const notifyMatch = (user, partner) => {
         pub.publish("socket:broadcast", JSON.stringify({
            targetSocketId: user.socketId,
            event: "matched",
            data: { roomId }
         }));
      };

      notifyMatch(boy, girl);
      notifyMatch(girl, boy);

      const rd = Math.floor(Math.random() * 9 + 1);
      const qReceiver = (rd % 2) ? boy.socketId : girl.socketId;

      pub.publish("socket:broadcast", JSON.stringify({
         targetSocketId: qReceiver,
         event: "questions",
         data: getQuestions()
      }));

      // Timer for continue_prompt
      // This is tricky in distributed env. 
      // Ideally, we schedule a job. 
      // For simplicity/hack in MVP: We can rely on client-side timers or 
      // just set a key with TTL and use key-space notifications (complex)
      // OR, since this specific instance matched them, it can hold the timeout in memory?
      // Risk: If this instance dies, the prompt never sends. 
      // Acceptable for MVP.
      
      setTimeout(() => {
        pub.publish("socket:broadcast", JSON.stringify({
            targetSocketId: boy.socketId,
            event: "continue_prompt"
        }));
        pub.publish("socket:broadcast", JSON.stringify({
            targetSocketId: girl.socketId,
            event: "continue_prompt"
        }));
      }, CHAT_TIME);
    }
    
    // Broadcast Pool Stats
    // We can calculate stats from Redis
    const boysCount = await redis.scard("pool:boys");
    const girlsCount = await redis.scard("pool:girls");
     // totalRooms is hard to count efficiently without a counter key. 
     // We can increment a counter "stats:total_rooms" on match and decrement on close?
     // Or just scan keys? Scan is bad.
     // For MVP, approximate or skip rooms count?
     // Let's assume we don't strictly need accurate room count for now or fix it later.
    const totalRooms = 0; // Placeholder

    const statsMessage = JSON.stringify({
        event: "pool_stats",
        data: { boysCount, girlsCount, totalRooms }
    });

    // Broadcast to everyone in pool
    // We need to fetch all IDs again? Or just publish to everyone?
    // "socket:broadcast" needs a targetSocketId.
    // If we want to broadcast to ALL, we might need a special "ALL" target or separate channel.
    // Let's assume we iterate for now or change handlers to listen to "socket:broadcast_all".
    
    // Optimized: Create a new channel based logic in handlers? 
    // Or just iterate standard pool users.
    const currentBoys = await getPoolUsers("boys"); // Re-fetch remaining
    const currentGirls = await getPoolUsers("girls");

    [...currentBoys, ...currentGirls].forEach(u => {
        pub.publish("socket:broadcast", JSON.stringify({
            targetSocketId: u.socketId,
            event: "pool_stats",
            data: { boysCount, girlsCount, totalRooms }
        }));
    });

  }, MATCH_INTERVAL);
};
