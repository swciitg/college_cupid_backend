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
        res.send("Invalid user")
    }
}

function  authorisation(req,res,next){
    const cookietoken=req.cookies?.token;
    if(!cookietoken)return next();
    const token=cookietoken;
    const user=verifyToken(token);
    req.user=user;
    next();

}

module.exports={createToken,verifyToken,authorisation};