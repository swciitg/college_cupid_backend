const {Router}=require("express");
const matchController = require('../controllers/matchController');
const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require("../handlers/asyncErrorHandler");
const matchRouter = Router();


matchRouter.post('/match/find', authenticateToken, asyncErrorHandler(matchController.findMatches));
matchRouter.delete('/match/clear', authenticateToken, asyncErrorHandler(matchController.clearMatches));
matchRouter.get('/match', authenticateToken, asyncErrorHandler(matchController.getMatches));

module.exports = {matchRouter};