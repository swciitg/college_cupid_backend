const express = require("express");
const blockedUserController = require("../controllers/blockedUser.js");
const asyncErrorHandler = require("../handlers/asyncErrorHandler");
const { authenticateToken } = require("../middlewares/jwtAuthHandler.js");

const blockedRouter = express.Router();

blockedRouter.get(
  "/blocked",
  authenticateToken,
  asyncErrorHandler(blockedUserController.checkIfUserBlocked),
);

exports.blockedRouter = blockedRouter;
