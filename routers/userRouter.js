const {Router}=require("express");
const userController = require('../controllers/userController.js');
const userRouter = Router();
const multer = require("multer");
const {authenticateToken}=require('../middlewares/jwtAuthHandler.js');
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
userRouter.post('/user', authenticateToken, upload.single('dp'), userController.postUserInfo);
userRouter.put('/user/profile', authenticateToken, upload.single('dp'), userController.updateProfile);
userRouter.get('/user', authenticateToken, userController.getAllUsers);
userRouter.get('/user/email/:email', authenticateToken, userController.getUserInfo);
userRouter.get('/user/personalInfo', authenticateToken, userController.getPersonalInfo);

module.exports = { userRouter };