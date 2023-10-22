const {Router}=require("express");
const imageRouter = Router();
const imageController = require('../controllers/imageController');
const {authenticateToken}=require('../middlewares/jwtAuthHandler.js');

imageRouter.get('/getImage', authenticateToken, imageController.getImage);

module.exports = {imageRouter};