const jwt = require('jsonwebtoken');
const {RefreshTokenError} = require('../errors/jwtAuthError');
const {RequestValidationError} = require('../errors/requestValidationError');
const {createAccessToken} = require('../handlers/jwtHandler');

exports.regenerateToken = async(req, res) => {
    try {
        const authorization = req.headers['authorization'];
        if(!authorization) {
            throw new RequestValidationError('Refresh Token is not passed');
        }
    
        const token = authorization.split(' ')[1];
    
        if(token == null) {
            throw new RequestValidationError('Refresh Token is not passed');
        }
    
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err){
                throw new RefreshTokenError(err.message);
            }
            const accessToken = createAccessToken(user.email);
    
            res.status(200).json({accessToken: accessToken});
        });
    } catch (error) {
        res.json({message: error.message});
    }
};