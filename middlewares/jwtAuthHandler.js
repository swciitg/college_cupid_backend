const jwt = require('jsonwebtoken');
const {AccessTokenError} = require('../errors/jwtAuthError');
const {RequestValidationError} = require('../errors/requestValidationError');
const {ForbiddenResourceError} = require('../errors/forbiddenResourceError');
const { AdminList } = require('../shared/constants');

// Update your authenticateToken middleware to add logging
exports.authenticateToken = (req, res, next) => {
    console.log('=== AUTHENTICATE TOKEN MIDDLEWARE ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);

    const authorization = req.headers['authorization'];
    console.log('Authorization header:', authorization);

    if(!authorization) {
        console.log('ERROR: No authorization header');
        return next(new RequestValidationError('Access Token is not passed.'));
    }

    const token = authorization.split(' ')[1];
    console.log('Token extracted:', token ? 'Present' : 'Missing');

    if(token == null) {
        console.log('ERROR: Token is null');
        return next(new RequestValidationError('Access Token is not passed.'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            console.log('JWT VERIFICATION ERROR:', err.message);
            console.log('Token:', token);
            return next(new AccessTokenError(err.message));
        }
        console.log('JWT VERIFIED - User:', user);
        req.email = user.email;
        next();
    });
};

exports.verifyAdmin = (req, res, next) => {
    if(!req.email){
        next(new RequestValidationError('User is not authenticated.'));
    }
    if(AdminList.includes(req.email) == false){
        next(new ForbiddenResourceError('User cannot access the API.'));
    }
    next();
}
