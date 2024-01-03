const {Router}=require("express");
const matchController = require('../controllers/matchController');
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require("../handlers/asyncErrorHandler");
const matchRouter = Router();


matchRouter.post('/match/find', authenticateToken, verifyAdmin, asyncErrorHandler(matchController.findMatches));
matchRouter.delete('/match/clear', authenticateToken, verifyAdmin, asyncErrorHandler(matchController.clearMatches));
matchRouter.get('/match', authenticateToken, asyncErrorHandler(matchController.getMatches));

module.exports = {matchRouter};