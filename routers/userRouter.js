const { Router } = require("express");
const userController = require('../controllers/userController.js');
const userRouter = Router();
const multer = require("multer");
const { authenticateToken } = require('../middlewares/jwtAuthHandler.js');
const uuid = require('uuid');

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

userRouter.delete('/user/clear', userController.clearUsers);

userRouter.post('/user/profile', authenticateToken, upload.single('dp'), userController.postUserProfile);
userRouter.put('/user/profile', authenticateToken, upload.single('dp'), userController.updateUserProfile);
userRouter.get('/user/profile/email/:email', authenticateToken, userController.getUserProfile);
userRouter.get('/user/profile/all', authenticateToken, userController.getAllUserProfiles);

userRouter.post('/user/personalInfo', authenticateToken, userController.postPersonalInfo);
userRouter.get('/user/personalInfo', authenticateToken, userController.getPersonalInfo);

module.exports = { userRouter };