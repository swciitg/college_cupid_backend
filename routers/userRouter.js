const { Router } = require("express");
const userController = require('../controllers/userController.js');
const userRouter = Router();
const multer = require("multer");
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler.js');
const uuid = require('uuid');
const asyncErrorHandler = require("../handlers/asyncErrorHandler.js");

// multer config
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './images');
    },
    filename: (req, file, callback) => {
        const imageId = uuid.v4();
        // const imageUrl = process.env.BASE_URL + '/getImage/?photoId=' + imageId;
        const imageUrl = 'https://swc.iitg.ac.in/collegeCupid/getImage/?photoId=' + imageId;
        callback(null, imageId + '.png');
        req.imageUrl = imageUrl;
    }
});
const upload = multer({ storage: storage });

userRouter.delete('/user/clear', authenticateToken, verifyAdmin, asyncErrorHandler(userController.clearUsers));

userRouter.post('/user/profile', authenticateToken, upload.single('dp'), asyncErrorHandler(userController.createUserProfile));
userRouter.put('/user/profile', authenticateToken, upload.single('dp'), asyncErrorHandler(userController.updateUserProfile));
userRouter.get('/user/profile/email/:email', authenticateToken, asyncErrorHandler(userController.getUserProfile));
userRouter.get('/user/profile/page/:pageNumber', authenticateToken, asyncErrorHandler(userController.getUserProfilePages));

userRouter.post('/user/personalInfo', authenticateToken, asyncErrorHandler(userController.postPersonalInfo));
userRouter.get('/user/personalInfo', authenticateToken, asyncErrorHandler(userController.getPersonalInfo));

module.exports = { userRouter };