const { Schema, model } = require('mongoose');
const { CONFESSIONS_REPORTS_ENUM, CONFESSIONS_TYPE_ENUM} = require("../shared/constants.js")

const ConfessionsSchema = new Schema({
    encryptedEmail : {
        type : String ,
        required: true
    } , 
    text : {
        type : String ,
        required : true
    } , 
    reactions: [
        {
            _id : false,
            reaction: {
                type: String,
                required: true
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "UserProfile",
                required: true
            }
        }
    ],
    replies : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Reply'
        }
    ] , 
    typeOfConfession : {
        type : String ,
        enum : CONFESSIONS_TYPE_ENUM,
        default : ""
    } , 
    song : { 
        type : String , // url of the song in use - consult with app guys
        default : ""
    } ,
    reports : [
        {
            _id : false,
            category : {
                type : String,
                enum : CONFESSIONS_REPORTS_ENUM 
            } , 
            user : {
                type:  Schema.Types.ObjectId,
                ref: "UserProfile",
                required: true
            }
        } 
    ]
} , 
    {
        timestamps : true
    }
);

const Confessions = model('Confessions', ConfessionsSchema);
module.exports = Confessions;