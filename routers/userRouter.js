const {Router}=require("express");
const userController = require('../controllers/userController.js');
const userRouter = Router();
const multer = require("multer");
const {authenticateToken}=require('../middlewares/jwtAuthHandler.js');
const cloudinary = require("cloudinary").v2;

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.delete('/user/clear', userController.clearUsers);
userRouter.post('/user', upload.single('dp'), userController.postUserInfo);
userRouter.post('/user/login', userController.loginUser);
userRouter.put('/user/profile', authenticateToken, upload.single('dp'), userController.updateProfile);
userRouter.get('/user/', authenticateToken, userController.getAllUsers);
userRouter.get('/user/:email', authenticateToken, userController.getUserInfo);

module.exports = { userRouter };