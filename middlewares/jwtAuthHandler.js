const jwt = require('jsonwebtoken');
const {AccessTokenError} = require('../errors/jwtAuthError');
const {RequestValidationError} = require('../errors/requestValidationError');
const {ForbiddenResourceError} = require('../errors/forbiddenResourceError');
const { AdminList } = require('../shared/constants');

exports.authenticateToken = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if(!authorization) {
        return next(new RequestValidationError('Access Token is not passed.'));
    }

    const token = authorization.split(' ')[1];

    if(token == null) {
        return next(new RequestValidationError('Access Token is not passed.'));
    }


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,  (err, user) => {
        if(err) {
            console.log(err.message);
            return next(new AccessTokenError(err.message));
        }
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

exports.authenticateWSToken = (req) => {
    console.log('[WS Auth] Starting authentication');
    console.log('[WS Auth] Headers:', { 
        hasSecurityKey: !!req.headers["security-key"],
        hasAuthorization: !!req.headers["authorization"]
    });
    
    if (req.headers["security-key"] !== process.env.SECURITY_KEY){
        console.log('[WS Auth] Security key validation failed');
        throw new Error("Security-key is missing");
    }
    console.log('[WS Auth] Security key validated');
    
    const auth = req.headers["authorization"];
    if (!auth) {
        console.log('[WS Auth] Authorization header missing');
        throw new Error("Access token missing");
    }

    const token = auth.split(" ")[1];
    console.log('[WS Auth] Token extracted, length:', token?.length || 0);
    if (!token) {
        console.log('[WS Auth] Token extraction failed');
        throw new Error("Access token missing");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('[WS Auth] Token verified successfully, email:', decoded.email);
        return decoded;
    } catch (error) {
        console.log('[WS Auth] Token verification failed:', error.message);
        throw error;
    }
}