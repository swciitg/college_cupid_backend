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
    },
    'encryptedCrushes': {
        type: [String],
        default: [],
    },
    'matches': {
        type: [String],
        default: [],
    }
});

const PersonalInfo = model('PersonalInfo', personalInfoSchema);
module.exports = PersonalInfo;