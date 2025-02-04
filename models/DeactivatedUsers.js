const { Schema, model } = require('mongoose');

const DeactivatedUsersSchema = new Schema({
    'email': {
        type: String,
        unique: true,
        required: [true, 'Email is a required field!']
    }
});

const DeactivatedUsers = model('DeactivatedUsers', DeactivatedUsersSchema);
module.exports = DeactivatedUsers;