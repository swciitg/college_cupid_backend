const { Router } = require("express");
const imageRouter = Router();
const imageController = require("../controllers/imageController");
const multer = require("multer");
const uuid = require("uuid");
const compressImage = require("../middlewares/compressImage");
const { authenticateToken } = require("../middlewares/jwtAuthHandler");
const asyncErrorHandler = require("../handlers/asyncErrorHandler");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./images");
  },
  filename: (req, file, callback) => {
    const imageId = uuid.v4();
    const imageUrl = process.env.BASE_URL +process.env.API_URL + "/getImage/?photoId=" + imageId;
    callback(null, imageId + ".jpg");
    req.imageUrl = imageUrl;
    req.imageId = imageId;
  },
});
const upload = multer({ storage: storage });
imageRouter.post("/uploadImage",authenticateToken, upload.single("dp"),compressImage,asyncErrorHandler(imageController.uploadImage));
imageRouter.get("/getImage", imageController.getImage);
imageRouter.delete("/deleteImage/:photoId",authenticateToken, asyncErrorHandler(imageController.deleteImage));

module.exports = { imageRouter };
