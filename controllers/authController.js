// const jwt=require("jsonwebtoken");

// const accessjwtsecret = process.env.ACCESS_TOKEN_SECRET;
// const refreshjwtsecret = process.env.REFRESH_TOKEN_SECRET;

// let getUserTokensString = async (userid) => {
//     const accessToken = jwt.sign({ email }, accessjwtsecret, {
//         expiresIn: "10 days",
//     });
//     const refreshToken = jwt.sign({ email }, refreshjwtsecret, {
//         expiresIn: "30 days",
//     });
//     return `${accessToken}/${refreshToken}`; // for outlook login
// };
  
// exports.getUserTokens = getUserTokensString;
  
// exports.regenerateUserAccessToken = asyncHandler(async (req, res, next) => {
//     let refreshToken = req.headers.authorization.split(" ").slice(-1)[0];
//     if (!refreshToken)
//         next(new RequestValidationError("Refresh token not passed"));
//     console.log(refreshToken);
//     let decoded;
//     jwt.verify(refreshToken, refreshjwtsecret, (err, dec) => {
//         if (err) {
//             console.log("ERROR OCCURED");
//             next();
//         }
//         decoded = dec;
//     });
//     console.log(decoded);

//     if (await onestopUserModel.findById(decoded.email)) {
//         const accessToken = jwt.sign({ email: decoded.email }, accessjwtsecret, {
//             expiresIn: "10 days",
//         });
//         console.log(accessToken);
//         res.json({ success: true, accessToken });
//     } else next();
// });

// function createToken({email,pubicKey}){
//     const payload={email,pubicKey}
//     const token=jwt.sign(payload,accessjwtsecret);
//     return token;
// }

// const verifyToken=(token)=>{
//     try{
    
//         const payload=jwt.verify(token,accessjwtsecret);
//         return payload;
//     }
//     catch(err){
//         return null;
//     }
// }

// function  authorisation(req,res,next){
//     req.body=null;
//     console.log(req.cookies);
//     const cookietoken=req.cookies["token"];
//     if(cookietoken===null)return next();
//     const token=cookietoken;
//     const user=verifyToken(token);
//     req.body=user;
//     next();
// }

// module.exports={createToken,verifyToken,authorisation};


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