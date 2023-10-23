const { Schema, model } = require("mongoose");

const personalInfoSchema = new Schema({
    "email": {
        type: String,
        required: true,
        unique: true
    },
    "hashedPassword": {
        type: String,
        required: true
    },
    "publicKey": {
        type: String,
        required: true,
    },
    "encryptedPrivateKey": {
        type: String,
        required: true,
    },
    "crushes": {
        type: [String],
        default: [],
    },
    "encryptedCrushes": {
        type: [String],
        default: [],
    },
    "matches": {
        type: [String],
        default: [],
    }
});

const PersonalInfo = model("PersonalInfo", personalInfoSchema);
module.exports = PersonalInfo;