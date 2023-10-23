const { Schema, model } = require("mongoose");
const userProfileSchema = new Schema({
    "name": {
        type: String,
        required: true
    },
    "gender": {
        type: String,
        required: true
    },
    "email": {
        type: String,
        required: true,
        unique: true
    },
    "profilePicUrl": {
        type: String,
        default: ''
    },
    "program": {
        type: String,
        required: true
    },
    "yearOfStudy": {
        type: String,
        required: true
    },
    "interests": {
        type: [String],
        default: [],
    },
    "bio": {
        type: String,
        default: ''
    },
    "publicKey": {
        type: String,
        required: true,
    },
});



const UserProfile = model("UserProfile", userProfileSchema);
module.exports = UserProfile;
