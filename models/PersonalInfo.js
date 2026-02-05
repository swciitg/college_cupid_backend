const { Schema, model } = require('mongoose');

const personalInfoSchema = new Schema({
    'email': {
        type: String,
        required: [true, 'Email is a required field!'],
        unique: true
    },
    'sharedSecretList': {
        type: [String],
        default: [],
        validate: [crushArrayLimit, 'SharedSecrets must not exceed seven!'],
    },
    'receivedLikesSecrets': {
        type: [String],
        default: [],
    },
    // here add another field for storing the sharedSecretKey generated when someone else likes this user
    // it will be an array and all the elements will be unique
    // this will be updated in the increaseCount, the sharedSecretKey will be appended
    // next when we need to find if a user has liked me or not in feed route - we simply compare the existence of the same key in thier this array and my secretKey
    // similar principle will be used to remove the people i have liked already from my feed
    // this will be fairly efficient as the complexity is at max 7*n and n is mostly less than 500
    'matchedEmailList': {
        type: [String],
        default: [],
        validate: [crushArrayLimit, 'MatchedEmails must not exceed seven!']
    }
});

function crushArrayLimit(val) {
    return val.length <= 7;
  }

const PersonalInfo = model('PersonalInfo', personalInfoSchema);
module.exports = PersonalInfo; 