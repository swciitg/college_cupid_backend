const { Schema, model } = require('mongoose');

const personalInfoSchema = new Schema({
    'email': {
        type: String,
        required: [true, 'Email is a required field!'],
        unique: true
    },
    'hashedPassword': {
        type: String,
        required: [true, 'Hashed Password is a required field!']
    },
    'publicKey': {
        type: String,
        required: [true, 'Public key is a required field!'],
    },
    'encryptedPrivateKey': {
        type: String,
        required: [true, 'Encrypted Private Key is a required field!'],
    },
    'crushes': {
        type: [String],
        default: [],
        validate: [crushArrayLimit, 'Crushes must not exceed five!'],
    },
    'encryptedCrushes': {
        type: [String],
        default: [],
        validate: [crushArrayLimit, 'Encrypted crushes must not exceed five!']
    },
    'matches': {
        type: [String],
        default: [],
        validate: [crushArrayLimit, 'Matches must not exceed five!']
    }
});

function crushArrayLimit(val) {
    return val.length <= 5;
  }

const PersonalInfo = model('PersonalInfo', personalInfoSchema);
module.exports = PersonalInfo;