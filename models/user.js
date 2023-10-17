const {Schema,model }=require("mongoose");
const userSchema=new Schema({
    "name":{
        type: String,
        required : true
    },
    "gender":{
        type: String,
        required: true
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
        default: ''
    },
    "program":{
        type: String,
        required: true
    },
    "yearOfStudy":{
        type: String,
        required: true
    },
    "interests": {
        type: [String],
        default: [],
    },
    "bio":{
        type:String,
        default:''
    },
    "publicKey":{
        type:String,
        required:true,
    },
    "encryptedPrivateKey":{
        type:String,
        required:true,
    },
    "crushes":{
        type: [String],
        default: [],
    },
    "encryptedCrushes":{
        type: [String],
        default: [],
    },
    "matches":{
        type: [String],
        default: [],
    }
});



const User=model("user",userSchema);
module.exports=User;
