const {Router}=require("express");
const reportUserController = require('../controllers/reportUserController');
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require("../handlers/asyncErrorHandler");
const reportUserRouter = Router();


reportUserRouter.post('/report/add', authenticateToken, 
    asyncErrorHandler(reportUserController.reportAUser)
);

module.exports = {reportUserRouter};