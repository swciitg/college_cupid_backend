const { boys, girls, rooms, POOL } = require("./state");

exports.socketHandlers = (io) => {
  io.on("connection", socket => {

    socket.on("join_pool", user => {
      user.room = null;
      user.chatStarted = null;

      socket.join(POOL);

      if (user.gender === 0) {
        boys.push({ socketId: socket.id, user });
      } else {
        girls.push({ socketId: socket.id, user });
      }
    });

    socket.on("chat_message", ({ roomId, message }) => {
      const room = rooms[roomId];
      if (!room || !room.members.includes(socket.id)) {
        return;
      }
      socket.to(roomId).emit("chat_message", message);
    });

    socket.on("continue_response", ({ roomId, answer }) => {
      socket.to(roomId).emit("continue_response", answer);

      const room = rooms[roomId];
      if (!room) return;

      room.responses.push(answer);

      if (room.responses.length === 2) {
        io.to(roomId).emit("chat_closed");
        clearTimeout(room.timer);
        delete rooms[roomId];
      }
    });

    socket.on("leave" , () => {
      const boyIndex = boys.findIndex(b => b.socketId === socket.id);
      if (boyIndex !== -1) {
        boys.splice(boyIndex, 1);
      }
      const girlIndex = girls.findIndex(g => g.socketId === socket.id);
      if (girlIndex !== -1) {
        girls.splice(girlIndex, 1);
      }
      for (const roomId in rooms) {
        const room = rooms[roomId];

        if (room.members.includes(socket.id)) {
          room.members.forEach(memberId => {
            if (memberId !== socket.id) {
              io.to(memberId).emit("partner_left");
            }
          });

          clearTimeout(room.timer);
          delete rooms[roomId];
          break;
        }
      }
    })

    socket.on("disconnect", () => {
      const boyIndex = boys.findIndex(b => b.socketId === socket.id);
      if (boyIndex !== -1) {
        boys.splice(boyIndex, 1);
      }
      const girlIndex = girls.findIndex(g => g.socketId === socket.id);
      if (girlIndex !== -1) {
        girls.splice(girlIndex, 1);
      }
      for (const roomId in rooms) {
        const room = rooms[roomId];

        if (room.members.includes(socket.id)) {
          room.members.forEach(memberId => {
            if (memberId !== socket.id) {
              io.to(memberId).emit("partner_disconnected");
            }
          });

          clearTimeout(room.timer);
          delete rooms[roomId];
          break;
        }
      }
    });
  });
};
