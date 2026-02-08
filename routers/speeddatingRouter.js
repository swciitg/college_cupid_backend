const { Router } = require("express");
const speeddatingRouter = Router();
const speeddatingController = require("../controllers/speeddatingController");
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require("../handlers/asyncErrorHandler");

speeddatingRouter.put("/speed-dating", authenticateToken , verifyAdmin, asyncErrorHandler(speeddatingController.updateSpeedDating));
speeddatingRouter.get("/speed-dating", authenticateToken, asyncErrorHandler(speeddatingController.getSpeedDating));

module.exports = { speeddatingRouter };
