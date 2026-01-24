const { Schema, model } = require('mongoose');

const confessionReplySchema = new Schema({
    confessionId: {
        type: String,
        required: [true, 'Confession ID is required to link the reply!']
    },
    senderEmail: {
        type: String,
        required: [true, 'Sender email is a required field!']
    },
    receiverEmail: {
        type: String,
        required: [true, 'Receiver email (the confessor) is a required field!']
    },
    replyContent: {
        type: String,
        required: [true, 'Reply content cannot be empty!'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries in the "Updates" section (filtering by receiver)
confessionReplySchema.index({ receiverEmail: 1, createdAt: -1 });

const ConfessionReply = model('ConfessionReply', confessionReplySchema);
module.exports = ConfessionReply;