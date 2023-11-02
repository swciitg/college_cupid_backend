const {Router}=require("express");
const matchController = require('../controllers/matchController');
const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const matchRouter = Router();


matchRouter.post('/match/find', authenticateToken, matchController.findMatches);
matchRouter.get('/match', authenticateToken, matchController.getMatches);

module.exports = {matchRouter};