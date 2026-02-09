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
    if (req.headers["security-key"] !== process.env.SECURITY_KEY){
        throw new Error("Security-key is missing");
    }
    // const auth = req.headers["authorization"];
    // if (!auth) throw new Error("Access token missing");

    // const token = auth.split(" ")[1];
    // if (!token) throw new Error("Access token missing");

    // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // return decoded;
}