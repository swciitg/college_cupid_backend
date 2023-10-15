const express = require('express');
const { microsoftLogin, microsoftLoginRedirect } = require('../controllers/userAuthController');

const authRouter = express.Router();

authRouter.get('/', microsoftLogin);
authRouter.get('/redirect', microsoftLoginRedirect);

module.exports = authRouter;