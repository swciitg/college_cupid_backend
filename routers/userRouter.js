const { Router } = require("express");
const userController = require('../controllers/userController.js');
const userRouter = Router();
const multer = require("multer");
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler.js');
const uuid = require('uuid');
const asyncErrorHandler = require("../handlers/asyncErrorHandler.js");
const compressImage = require("../middlewares/compressImage.js");

// multer config
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './images');
    },
    filename: (req, file, callback) => {
        const imageId = uuid.v4();
        const imageUrl = process.env.BASE_URL + process.env.API_URL + '/getImage/?photoId=' + imageId;
        callback(null, imageId + '.jpg');
        req.imageUrl = imageUrl;
        req.imageId = imageId;
    }
});
const upload = multer({ storage: storage });

userRouter.delete('/user/remove/:email', authenticateToken, 
    verifyAdmin, asyncErrorHandler(userController.removeUserFromDB));

userRouter.post('/user/profile', authenticateToken, upload.single('dp'), compressImage,
    asyncErrorHandler(userController.createUserProfile)
);
userRouter.put('/user/profile', authenticateToken, upload.single('dp'), compressImage,
    asyncErrorHandler(userController.updateUserProfile)
);
userRouter.get('/user/profile/email/:email', authenticateToken, 
    asyncErrorHandler(userController.getUserProfile)
);
userRouter.get('/user/profile/page/:pageNumber', authenticateToken, 
    asyncErrorHandler(userController.getUserProfilePages)
);

userRouter.post('/user/personalInfo', authenticateToken, 
    asyncErrorHandler(userController.postPersonalInfo)
);
userRouter.get('/user/personalInfo', authenticateToken, 
    asyncErrorHandler(userController.getPersonalInfo)
);

module.exports = { userRouter };
