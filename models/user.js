const {Schema,model }=require("mongoose");
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

  
    "hashedPassword":{
        type:String,
        required:true
    },

    "profilePicUrl":{
        type:String,
    },

    "program":{
        enum:["btech","mtech", "bdes","phd"]
    },

    "year":{
        enum:["1","2","3","4","5"]
    },

    "interests":[
        {type :String}
    ],

    "bio":{
        type:String,
        required:true
    },

    "publicKey":{
        type:String,
        // required:true,
        default: ""
    },

    "encryptedPrivateKey":{
        type:String,
        // required:true,
        default: ""
    },

    "crushes":[
        {type:String},
    ],
    "encryptedCrushes":[
        {type:String}
    ],

    "matches":[
        {type:String}
    ]
});



const User=model("user",userSchema);
module.exports=User;
