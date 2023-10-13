const {Schema,model }=require("mongoose");
const userSchema=new Schema({
    "name":{
        type: String,
        required : true
    },
    
    "gender":{
        type: String
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
        type: String,
    },

    "yearOfStudy":{
        type: String
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
