const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const crushController = require('../controllers/crushController');
const { Router } = require('express');
const asyncErrorHandler = require('../handlers/asyncErrorHandler');
const crushRouter = Router();

crushRouter.put('/crush/add', authenticateToken, asyncErrorHandler(crushController.addCrush));
crushRouter.put('/crush/increaseCount', asyncErrorHandler(crushController.increaseCount));
crushRouter.put('/crush/decreaseCount', asyncErrorHandler(crushController.decreaseCount));
crushRouter.get('/crush/getCount', authenticateToken, asyncErrorHandler(crushController.getCount));
crushRouter.delete('/crush/remove', authenticateToken, asyncErrorHandler(crushController.removeCrush));
crushRouter.post('/crush/check', authenticateToken, asyncErrorHandler(crushController.checkCrushExists));
crushRouter.post('/crush/updateCrush', authenticateToken, asyncErrorHandler(crushController.updateCrushes));

module.exports = { crushRouter };