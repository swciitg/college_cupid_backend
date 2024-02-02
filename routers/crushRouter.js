const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const crushController = require('../controllers/crushController');
const { Router } = require('express');
const asyncErrorHandler = require('../handlers/asyncErrorHandler');
const crushRouter = Router();

crushRouter.put('/crush/add', authenticateToken, asyncErrorHandler(crushController.addCrush));
crushRouter.put('/crush/increaseCount', asyncErrorHandler(crushController.increaseCount));
crushRouter.put('/crush/decreaseCount', asyncErrorHandler(crushController.decreaseCount));
crushRouter.get('/crush/getCount', authenticateToken, asyncErrorHandler(crushController.getCount));
crushRouter.get('/crush', authenticateToken, asyncErrorHandler(crushController.getAllCrushes));
crushRouter.delete('/crush/remove', authenticateToken, asyncErrorHandler(crushController.removeCrush));

module.exports = { crushRouter };