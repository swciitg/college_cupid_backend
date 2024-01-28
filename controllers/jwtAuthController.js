const jwt = require('jsonwebtoken');
const { RefreshTokenError } = require('../errors/jwtAuthError');
const { RequestValidationError } = require('../errors/requestValidationError');
const { createAccessToken } = require('../handlers/jwtHandler');

exports.regenerateToken = async (req, res, next) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
        const err = new RequestValidationError('Refresh Token is not passed');
        return next(err);
    }

    const token = authorization.split(' ')[1];

    if (token == null) {
        const err = new RequestValidationError('Refresh Token is not passed');
        return next(err);
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            const error = new RefreshTokenError(err.message);
            return next(error);
        }
        const accessToken = createAccessToken(user.email);

        res.status(200).json({
            success: true,
            accessToken: accessToken
        });
    });
};