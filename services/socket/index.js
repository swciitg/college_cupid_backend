// const { Server } = require("socket.io");
const { socketHandlers } = require("./handler.js");
const { matchMaking } = require("./matchmakings.js");
const ws = require("ws");

module.exports = function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });

  socketHandlers(wss);
  matchMaking(wss);
};
