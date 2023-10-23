const {authenticateToken} = require('../middlewares/jwtAuthHandler');
const crushController = require('../controllers/crushController');
const {Router} = require('express');
const crushRouter = Router();

crushRouter.put('/crush/add', authenticateToken, crushController.addCrush);
crushRouter.delete('/crush/remove', authenticateToken, crushController.removeCrush);
crushRouter.get('/crush', authenticateToken, crushController.getAllCrushes);

module.exports = {crushRouter};