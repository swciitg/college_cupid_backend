const {Router}=require("express");
const routes=Router();
const User=require("../models/user");


routes.get("/",async(req,res)=>{
    
    const mac=new Map();
    const users=await User.find();
    
    users.map((user)=>{
    
        user.crushes.map((crush)=>{
            if(!mac.has(crush)){
                mac.set(crush);
                mac[crush]=[];
            }
            mac[crush].push(user._id);
        });
    })

    Object.keys(mac).map(async(key)=>{
        if(mac[key].length>1){
            console.log(mac[key]);
            await User.findOneAndUpdate({_id:mac[key][0]},{$push:{matches:mac[key][1]}});
            await User.findOneAndUpdate({_id:mac[key][1]},{$push:{matches:mac[key][0]}});
        }
    });
    res.send("helllo");
})

routes.get("/:id",async(req,res)=>{
    if(req.body==null)return res.send("invalid user");
    const user=await User.findOne({_id:req.params.id});
    const maches=[];
    var i=0
    for (const match of user.matches) {
        i++;
        const user1 = await User.findOne({ _id: match });
        maches.push(user1);
    }
    res.send(maches);
})
module.exports=routes;