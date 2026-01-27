const { Server } = require("socket.io");
const { socketHandlers } = require("./handlers.js");
const { matchMaking } = require("./matchmaking.js");

module.exports = function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  socketHandlers(io);
  matchMaking(io);
};
