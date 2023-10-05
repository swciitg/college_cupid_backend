const {Router}=require("express");
const routes=Router();
const {createToken,verifyToken}=require("../authentication/jwt")
const User=require("../models/user");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET,
  });
  
  // File Upload
  async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
  }

// multer config

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });


// sign in and take profile details from user

routes.post("/signin",upload.single('dp'),async(req,res)=>{
    
    const user=req.body;
    if(!user)res.send("no user");

    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);
        console.log(cldRes.url);
        var dp = "";
        dp = cldRes.url;
        user.dp=dp;
        console.log(user);
        await User.create(user);
        const token=createToken({email:user.email,pubicKey:user.publicKey});
        res.cookie("token",token);
        res.send({user,g:process.env.G_value});

    } catch (error) {
        console.log(error);
        res.send({
        message: error.message,
        });
    }
});

routes.post("/login",async(req,res)=>{
    const user=await User.find({email:req.body});
    if(!user)throw err("wrong email");
    const token=createToken({email:user.email,pubicKey:user.publicKey});
    res.cookie("token",token);
    res.json({user,g:process.env.G_value});
})

//update your profile

routes.put('/profile',async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    const payload=verifyToken(req.cookies["token"],process.env.SECRET);
    const user=await User.findOneAndUpdate({email:payload.email},req.body);
    try{
        res.send(user);
    }
    catch(err){
        res.send(err);
    }
})
// get all users

routes.get('/',async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    console.log(req.body);
    const user=await User.find();
    res.json({user});
})

// open particular user

routes.get('/:id',async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    const user=await User.findById(req.params.id);
    try{
        res.send({user});
    }
    catch(err){
        res.send(err);
    }
})

// add a new crush

routes.put('/addCrush/:id',async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    const user=await User.findOneAndUpdate({_id:req.params.id},{$push:{crushes:req.body._id}});
    res.send(user);
})

// delete crush

routes.delete("/deleteCrush/:id",async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    function arrayRemove(arr, value) {
        return arr.filter(function (geeks) {
            return geeks != value;
        });
    }
    const user=await User.findById(req.params.id);
    const list=user.crushes;
    const encryptlist=user.encryptCrushes;
    const newlist=arrayRemove(list,req.body.crush);
    const newencryptlist=arrayRemove(encryptlist,req.body.encryptCrush)
    const userupdate=await User.findByIdAndUpdate(req.params.id,{crushes:newlist,encryptCrushes:newencryptlist});
    res.send(userupdate);
})

// get all crushes

routes.get("/allCrushes/:id",async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    const user=User.findById(req.params.id);
    try{
        res.send(user.encryptCrushes);
    }
    catch(err){
        res.send(err);
    }
})
module.exports=routes;