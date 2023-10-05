const {Schema,model }=require("mongoose");
const {createHmac,randomBytes}=require("crypto");
const {createToken,verifyToken}=require("../authentication/jwt");
const userSchema=new Schema({
    "name":{
        type: String,
        required : true
    },
    
    "gender":{
        enum:["male","female"]
    },

    "email":{
        type:String,
        required:true,
        unique:true
    },

  
    "password":{
        type:String,
        required:true
    },

    "imagePic":{
        type:String,
    },

    "program":{
        enum:["btech","mtech","phd"]
    },

    "year":{
        enum:["1","2","3","4","5"]
    },

    "interest":[
        {type :String}
    ],

    "bio":{
        type:String,
        required:true
    },

    "publicKey":{
        type:Number,
        required:true
    },

    "privateKey":{
        type:String,
        required:true
    },

    "crushes":[
        {type:Number},
    ],
    "encryptCrushes":[
        {type:String}
    ],

    "matches":[
        {type:String}
    ]
});



const User=model("user",userSchema);
module.exports=User;
