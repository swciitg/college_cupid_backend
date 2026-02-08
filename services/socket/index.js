// const { Server } = require("socket.io");
const { socketHandlers } = require("./handlers.js");
const { matchMaking } = require("./matchmaking.js");
const ws = require("ws");

module.exports = function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });

  socketHandlers(wss);
  matchMaking(wss);
};
