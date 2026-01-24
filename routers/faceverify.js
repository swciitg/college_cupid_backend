const { Router } = require("express");
const faceverifyRouter = Router();
const {faceverifyController} = require("../controllers/faceverifycontroller");

faceverifyRouter.post('/faceverify', faceverifyController.verifyFace);

module.exports = { faceverifyRouter };