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
    'yearOfJoin': {
        type: Number,
        required: [true, 'Year of join is a required field!']
    },
    'interests': {
        type: [String],
        default: [],
        validate: [interestArrayLimit, 'Interests must lie in the range of 5 to 20!']
    },
    'bio': {
        type: String,
        default: ''
    },
    'publicKey': {
        type: String,
        required: [true, 'Public Key is a required field!'],
    },
    shuffleOrder: {
        type: [Number],
        default: undefined,
    },
    lastShuffle: {
        type: Number,
        default: undefined,
    }
});

function interestArrayLimit(val) {
    console.log("i was called");
    console.log(val);
    return val.length <= 20 && val.length >= 5;
  }

const UserProfile = model('UserProfile', userProfileSchema);
module.exports = UserProfile;
