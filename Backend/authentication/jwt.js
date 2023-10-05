const JWT=require("jsonwebtoken");

function createToken({email,pubicKey}){
    const payload={email,pubicKey}
    const token=JWT.sign(payload,process.env.SECRET);
    return token;
}

const verifyToken=(token)=>{
    try{
    
        const payload=JWT.verify(token,process.env.SECRET);
        return payload;
    }
    catch(err){
        return null;
    }
}

function  authorisation(req,res,next){
    req.body=null;
    console.log(req.cookies);
    const cookietoken=req.cookies["token"];
    if(cookietoken===null)return next();
    const token=cookietoken;
    const user=verifyToken(token);
    req.body=user;
    next();
}

module.exports={createToken,verifyToken,authorisation};