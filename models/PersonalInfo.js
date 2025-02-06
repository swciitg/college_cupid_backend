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
        validate: [crushArrayLimit, 'SharedSecrets must not exceed five!'],
    },
    'matchedEmailList': {
        type: [String],
        default: [],
        validate: [crushArrayLimit, 'MatchedEmails must not exceed five!']
    }
});

function crushArrayLimit(val) {
    return val.length <= 5;
  }

const PersonalInfo = model('PersonalInfo', personalInfoSchema);
module.exports = PersonalInfo;