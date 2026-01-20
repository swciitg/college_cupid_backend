const { Router } = require("express");
const confessionReplyController = require('../controllers/confessionReplyController'); // You will need to create this controller
const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require("../handlers/asyncErrorHandler");
const confessionReplyRouter = Router();

// Matches the style of your other routes (e.g., /crush/add)
confessionReplyRouter.post('/reply/add', authenticateToken, 
    asyncErrorHandler(confessionReplyController.addReply)
);

confessionReplyRouter.get('/reply/updates', authenticateToken, 
    asyncErrorHandler(confessionReplyController.getUpdates)
);

module.exports = { confessionReplyRouter };