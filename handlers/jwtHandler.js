const jwt = require('jsonwebtoken');

exports.createAccessToken = email => {
    return jwt.sign(
        {email: email},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '7d'}
    );
};

exports.createRefreshToken = email => {
    return jwt.sign(
        {email: email},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '30d'}
    );
};