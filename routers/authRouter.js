const express = require('express');
const microsoftController = require('../controllers/userAuthController');
const jwtController = require('../controllers/jwtAuthController');

const authRouter = express.Router();

authRouter.get('/auth/microsoft', microsoftController.microsoftLogin);
authRouter.get('/auth/microsoft/redirect', microsoftController.microsoftLoginRedirect);
authRouter.post('/auth/refreshToken', jwtController.regenerateToken);

module.exports = {authRouter};