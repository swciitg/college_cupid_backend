const { Router } = require("express");
const userController = require('../controllers/userController.js');
const userRouter = Router();
const multer = require("multer");
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler.js');
const uuid = require('uuid');
const asyncErrorHandler = require("../handlers/asyncErrorHandler.js");
const compressImage = require("../middlewares/compressImage.js");
const PersonalInfo = require("../models/PersonalInfo.js");

// multer config


userRouter.delete('/user/remove/:email', authenticateToken, 
    verifyAdmin, asyncErrorHandler(userController.removeUserFromDB));
userRouter.delete('/user/removeAll', authenticateToken, 
    verifyAdmin, asyncErrorHandler(userController.removeAllUsersFromDB));
userRouter.get('/user/all', authenticateToken, 
    verifyAdmin, asyncErrorHandler(userController.listAllUsers));
userRouter.post('/user/profile', authenticateToken,
    asyncErrorHandler(userController.createUserProfile)
);
userRouter.put('/user/profile', authenticateToken,
    asyncErrorHandler(userController.updateUserProfile)
);
userRouter.get('/user/profile/email/:email', authenticateToken, 
    asyncErrorHandler(userController.getUserProfile)
);
userRouter.delete('/user/profile/deactivate', authenticateToken, 
    asyncErrorHandler(userController.deactivateUser)
);
userRouter.put('/user/profile/reactivate', authenticateToken, 
    asyncErrorHandler(userController.reactivateUser)
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
