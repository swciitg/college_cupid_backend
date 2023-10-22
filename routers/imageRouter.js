const {Router}=require("express");
const imageRouter = Router();
const imageController = require('../controllers/imageController');

imageRouter.get('/getImage', imageController.getImage);

module.exports = {imageRouter};