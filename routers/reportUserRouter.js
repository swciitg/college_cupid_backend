const {Router}=require("express");
const reportUserController = require('../controllers/reportUserController');
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require("../handlers/asyncErrorHandler");
const reportUserRouter = Router();


reportUserRouter.post('/report/add', authenticateToken, 
    asyncErrorHandler(reportUserController.reportAUser)
);
reportUserRouter.get('/report/blockedUsers', authenticateToken, 
    asyncErrorHandler(reportUserController.getBlockedUsers)
);
reportUserRouter.delete('/report/unblock', authenticateToken, 
    asyncErrorHandler(reportUserController.unblockUser)
);

module.exports = {reportUserRouter};