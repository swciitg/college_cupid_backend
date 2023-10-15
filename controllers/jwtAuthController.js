const jwt = require('jsonwebtoken');

const createAccessToken = email => {
    return jwt.sign(
        {email: email},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '7d'}
    );
};

const createRefreshToken = email => {
    return jwt.sign(
        {email: email},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '30d'}
    );
};

const authenticateToken = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if(!authorization) {
        return res.status(401).json({message: 'Unauthorized user'});
    }

    const token = authorization.split(' ')[1];

    if(token == null) {
        return res.status(401).json({message: 'Unauthorized user'});
    }


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,  (err, user) => {
        if(err) {
            console.log(err.message);
            return res.status(401).json({message: err.message});
        }
        console.log(user);
        req.email = user.email;
        next();
    });
};

const regenerateToken = async(req, res, next) => {
    try{
        const token = req.cookies.refreshToken;

        if(!token)return res.status(440).json({message: 'No refresh token'});

        var email = null;

        verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err){
                console.log('ERROR IN VERIFICATION');
                console.log(err.message);
                return res.status(440).json({message: 'Refresh token expired. Login again!'})
            }
            console.log(user.email);
            firebaseId = user.email;
    
            const accessToken = createAccessToken(email);

            res.status(200).json({accessToken: accessToken});
        });
    }catch(e){
        res.status(440).json(e.message);
    }
};


module.exports = {
    authenticateToken,
    regenerateToken,
    createAccessToken,
    createRefreshToken
};