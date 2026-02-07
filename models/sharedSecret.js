const { Schema, model } = require('mongoose');

const sharedSecretSchema = new Schema({
    'sharedSecret' : {
        type: String ,
        unique : true
    }
});

sharedSecretSchema.index({ sharedSecret : 1 });

const SharedSecret = model('SharedSecret', sharedSecretSchema);
module.exports = SharedSecret;