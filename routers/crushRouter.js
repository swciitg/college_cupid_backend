const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const crushController = require('../controllers/crushController');
const { Router } = require('express');
const crushRouter = Router();

crushRouter.put('/crush/add', authenticateToken, crushController.addCrush);
crushRouter.get('/crush', authenticateToken, crushController.getAllCrushes);
crushRouter.delete('/crush/remove', authenticateToken, crushController.removeCrush);

module.exports = { crushRouter };