const { boys, girls, rooms, POOL } = require("./state.js");
const { randomRoomId, getQuestions , calcScore } = require("../../utils/socket.js");

exports.matchMaking = (io) => {
  setInterval(() => {
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
      if (usedBoys.has(s.bi) || usedGirls.has(s.gi) || s.score < 5) continue;
      usedBoys.add(s.bi);
      usedGirls.add(s.gi);
      pairs.push({ boy: boys[s.bi], girl: girls[s.gi] });
    }

    [...usedBoys].sort((a, b) => b - a).forEach(i => boys.splice(i, 1));
    [...usedGirls].sort((a, b) => b - a).forEach(i => girls.splice(i, 1));

    pairs.forEach(({ boy, girl }) => {
      const roomId = randomRoomId();
      rooms[roomId] = { members: [], responses: [] };

      [boy, girl].forEach(p => {
        io.sockets.sockets.get(p.socketId)?.leave(POOL);
        io.sockets.sockets.get(p.socketId)?.join(roomId);

        p.user.room = roomId;
        p.user.chatStarted = true;

        rooms[roomId].members.push(p.socketId);
        io.to(p.socketId).emit("matched", { roomId });
      });

      const qReceiver =
        Math.random() < 0.5 ? boy.socketId : girl.socketId;
      io.to(qReceiver).emit("questions", getQuestions());

      rooms[roomId].timer = setTimeout(() => {
        io.to(roomId).emit("continue_prompt");
      }, 3 * 60 * 1000);
    });
  }, 5000);
};
