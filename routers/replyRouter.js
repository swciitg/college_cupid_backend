const { Router } = require("express");
const replyController = require('../controllers/replyController.js'); // You will need to create this controller
const { authenticateToken } = require('../middlewares/jwtAuthHandler.js');
const asyncErrorHandler = require("../handlers/asyncErrorHandler.js");
const replyRouter = Router();

// Matches the style of your other routes (e.g., /crush/add)
replyRouter.post('/reply/add', authenticateToken, 
    asyncErrorHandler(replyController.addReply)
);

replyRouter.post('/reply/updates', authenticateToken, 
    asyncErrorHandler(replyController.getUpdates)
);

module.exports = { replyRouter };