const {Router}=require("express");
const routes=Router();
const {createAccessToken, createRefreshToken, authenticateToken}=require("../controllers/jwtAuthController.js");
const User=require("../models/user");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
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

// delete all users
routes.delete('/clear', async(req, res) => {
    try{
        await User.deleteMany({});
        res.send('success');
    }catch(e){
        console.log(e);
        res.send(e.message);
    }
});


// sign in and take profile details from user

routes.post("/signin",upload.single('dp'),async(req,res)=>{
    console.log("signin");
    const user=req.body;
    if(!user)res.send("no user");

    try {
        if(req.file){
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const cldRes = await handleUpload(dataURI);
            console.log(cldRes.url);
            var url = cldRes.url;
            user.profilePicUrl = url;
        }
        console.log(user);

        const newUser = new User(user);
        await newUser.save();

        const accessToken = createAccessToken(user.email);
        const refreshToken = createRefreshToken(user.email);

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     path: '/user/refresh_token'
        // });

        res.status(200).send({
            accessToken, 
            refreshToken
        });

    } catch (error) {
        console.log(error);
        res.send({
            message: error.message,
        });
    }
});

// login user

routes.post("/login", async(req,res)=>{
    const user = await User.find({email:req.body.email});
    if(!user)throw err("wrong email");
    
    const accessToken = createAccessToken({email:user.email});
    const refreshToken = createRefreshToken({email:user.email});

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: '/user/refresh_token'
    });

    res.json({
        accessToken,
        gValue: process.env.G_VALUE
    });
})

//update your profile

routes.put('/profile', authenticateToken, async(req,res)=>{
    if(req.body==null)return res.send("invalid")

    try{
        const user = await User.findOneAndUpdate({email: req.email}, req.body);
        res.send({message: "Profile updated successfully"});
    }
    catch(err){
        res.send(err);
    }
})
// get all users

routes.get('/', authenticateToken, async(req,res) => {
    if(req.body==null)return res.send("invalid")

    try {
        const users = await User.find();
        var usersInfo = [];
        users.forEach((user) => {
            usersInfo.push({
                email: user.email,
                name: user.name,
                profilePicUrl: user.profilePicUrl ?? '',
                publicKey: user.publicKey,
                gender: user.gender,
                bio: user.bio,
                yearOfStudy: user.yearOfStudy,
                program: user.program,
                interests: user.interests
            });
        });

        console.log(usersInfo);

        res.json({users: usersInfo});
    } catch (error) {
        res.send(error);
    }
})

// open particular user

routes.get('/:email', authenticateToken, async(req,res)=>{
    if(req.body==null)return res.send("invalid")
    try{
        const user=await User.findOne({email: req.params.email});
        res.send({user});
    }
    catch(err){
        res.send(err);
    }
})

// add a new crush

routes.put('/addCrush', authenticateToken, async(req,res)=>{
    if(req.body==null)return res.send("invalid")

    try {
        await User.findOneAndUpdate({email:req.email},
            {$push:{crushes:req.body.sharedSecret}, $push: {encryptedCrushes: req.body.encryptedCrushEmail}
        });
        
        res.send({message: "Crush added successfully"});
    } catch (error) {
        res.send(error);
    }
})

// delete crush

routes.delete('/deleteCrush/:id', authenticateToken, async(req,res) => {
    if(req.body==null)return res.send("invalid");

    try {
        function arrayRemove(arr, value) {
            return arr.filter(function (geeks) {
                return geeks != value;
            });
        }
        const user = await User.findOne({email: req.email});
        
        const list = user.crushes;
        const encryptlist = user.encryptedCrushes;

        const newlist = arrayRemove(list,req.params.id);
        // const newencryptlist = arrayRemove(encryptlist,req.);

        await User.findOneAndUpdate({email: req.email}, {
            crushes: newlist, 
            // encryptedCrushes: newencryptlist
        });
        res.send({message: 'Crush deleted successfully'});
    } catch (error) {
        res.send(error);
    }
})

// get all crushes

routes.get('/allCrushes', authenticateToken, async(req,res) => {
    if(req.body==null)return res.send("invalid")
    
    try{
        const user = await User.findOne({email: req.email});

        res.send({encryptedCrushes: user.encryptedCrushes});
    }
    catch(err){
        res.send(err);
    }
})

module.exports=routes;