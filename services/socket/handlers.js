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

    socket.on("disconnect", () => {
      boys.splice(boys.findIndex(b => b.socketId === socket.id), 1);
      girls.splice(girls.findIndex(g => g.socketId === socket.id), 1);
    });
  });
};
