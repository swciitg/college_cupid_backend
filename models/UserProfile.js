const { Schema, model } = require('mongoose');
const userProfileSchema = new Schema({
    'name': {
        type: String,
        required: [true, 'Name is a required field!']
    },
    'gender': {
        type: String,
        required: [true, 'Gender is a required field!']
    },
    'email': {
        type: String,
        required: [true, 'Email is a required field!'],
        unique: true
    },
    'profilePicUrl': {
        type: String,
        default: ''
    },
    'program': {
        type: String,
        required: [true, 'Program is a required field!']
    },
    'yearOfStudy': {
        type: String,
        required: [true, 'Year of study is a required field!']
    },
    'interests': {
        type: [String],
        default: [],
    },
    'bio': {
        type: String,
        default: ''
    },
    'publicKey': {
        type: String,
        required: [true, 'Public Key is a required field!'],
    },
});


const UserProfile = model('UserProfile', userProfileSchema);
module.exports = UserProfile;
