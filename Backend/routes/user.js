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



routes.post("/login",async(req,res)=>{
    const user=await User.find({email:req.body});
    if(!user)throw err("wrong email");
    const token=createToken({email:user.email,pubicKey:user.publicKey});
    res.cookie("token",token);
    res.json({user})
})

// get all users

routes.get('/',async(req,res)=>{
    const user=await User.find();
    res.json({user});
})

// sign in and take profile details from user

routes.post("/signin",upload.single('dp'),async(req,res)=>{
    
    const user=req.body;

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
        res.send(user);
    } catch (error) {
        console.log(error);
        res.send({
        message: error.message,
        });
    }
});

// add a new crush

routes.put('/addCrush/:id',async(req,res)=>{
    
    const user=await User.findOneAndUpdate({_id:req.params.id},{$push:{crushes:req.body._id}});
    // res.send(user);
    console.log(req.params.id);
    res.send("hello");
})

module.exports=routes;