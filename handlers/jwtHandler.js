const jwt = require('jsonwebtoken');

const createAccessToken = (email) => {
    return jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
};

const createRefreshToken = (email) => {
    return jwt.sign(
        { email: email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = {
    createAccessToken,
    createRefreshToken
};
