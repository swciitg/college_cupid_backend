const jwt = require('jsonwebtoken');
const {AccessTokenError} = require('../errors/jwtAuthError');
const {RequestValidationError} = require('../errors/requestValidationError');

exports.authenticateToken = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if(!authorization) {
        return next(new RequestValidationError('Access Token is not passed'));
    }

    const token = authorization.split(' ')[1];

    if(token == null) {
        return next(new RequestValidationError('Access Token is not passed'));
    }


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,  (err, user) => {
        if(err) {
            console.log(err.message);
            return next(new AccessTokenError(err.message));
        }
        console.log(user);
        req.email = user.email;
        next();
    });
};