const { Schema, model } = require('mongoose');

const blockedUserListSchema = new Schema({
    'email': {
        type: String,
        unique: true,
        required: [true, 'Email is a required field!']
    },
    'blockedUsers': {
        type: [String],
        default: []
    }
});

const BlockedUserList = model('BlockedUserList', blockedUserListSchema);
module.exports = BlockedUserList;