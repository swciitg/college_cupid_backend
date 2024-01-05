const express = require('express');
const microsoftController = require('../controllers/userAuthController');
const jwtController = require('../controllers/jwtAuthController');
const asyncErrorHandler = require('../handlers/asyncErrorHandler');

const authRouter = express.Router();

authRouter.get('/auth/microsoft', asyncErrorHandler(microsoftController.microsoftLogin));
authRouter.get('/auth/microsoft/redirect', asyncErrorHandler(microsoftController.microsoftLoginRedirect));
authRouter.post('/auth/refreshToken', asyncErrorHandler(jwtController.regenerateToken));

module.exports = {authRouter};