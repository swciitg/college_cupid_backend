const { boys, girls, rooms, CHAT_TIME, MIN_SCORE, MATCH_INTERVAL , incrementMatches } = require("./constants.js")
const { randomRoomId, getQuestions, calcScore ,  } = require("../../utils/socket.js");


exports.matchMaking = (wss) => {
  setInterval(() => {
    if (boys.length < 1 || girls.length < 1) return;
    let scores = [];

    // console.log("RUNNING...")
    for (let i = 0; i < boys.length; i++) {
      for (let j = 0; j < girls.length; j++) {
        scores.push({
          score: calcScore(boys[i].user, girls[j].user),
          bi: i,
          gi: j
        });
      }
    }

    // console.log("SCORES : " , scores);
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

    [...usedBoys].sort((a, b) => b - a).forEach(i => boys.splice(i, 1));
    [...usedGirls].sort((a, b) => b - a).forEach(i => girls.splice(i, 1));

    const getSocketById = (id) => {
      for (const client of wss.clients) {
        if (client.id === id && client.readyState === 1) return client;
      }
      return null;
    };

    const emitTo = (socketId, event, data) => {
      const socket = getSocketById(socketId);
      if (!socket) return;
      socket.send(JSON.stringify({ event, data }));
    };

    const emitToRoom = (roomId, event, data) => {
      const room = rooms[roomId];
      if (!room) return;
      room.members.forEach(id => emitTo(id, event, data));
    };

    pairs.forEach(({ boy, girl }) => {
      const roomId = randomRoomId();

      rooms[roomId] = {
        members: [],
        responses: [],
        membersDetails: []
      };

      [boy, girl].forEach(p => {
        const socket = getSocketById(p.socketId);
        if (!socket) return;

        socket.roomId = roomId;

        p.user.room = roomId;
        p.user.chatStarted = true;

        rooms[roomId].members.push(p.socketId);
        rooms[roomId].membersDetails.push(p);

        // console.log(p.socketId);

        emitTo(p.socketId, "matched", { roomId });
      });
      const rd = Math.floor(Math.random() * 9 + 1);
      const qReceiver = (rd % 2)? boy.socketId : girl.socketId;

      emitTo(qReceiver, "questions", getQuestions());

      rooms[roomId].timer = setTimeout(() => {
        emitToRoom(roomId, "continue_prompt");
      }, CHAT_TIME);
    });

  }, MATCH_INTERVAL);
};
