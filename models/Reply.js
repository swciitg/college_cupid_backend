const { Schema, model } = require('mongoose');

const replySchema = new Schema({
    confessionId: {
        type: Schema.Types.ObjectId,
        ref: "Confessions",
    },
    senderEmail: {
        type: String,
        required: [true, 'Sender email is a required field!']
    },
    receiverEmail: {
        type: String ,
        required: [true, 'Receiver email is a required field!']
    },
    replyContent: {
        type: String,
        required: [true, 'Reply content cannot be empty!'],
        trim: true
    },
    entityType : {
        type: String ,
        enum: ["QUESTIONS" , "IMAGES" , "MATCHES" , "BLIND_DATING_MATCH"]
    }, 
    entitySerial : {
        type : Number 
    },
    isRead: {
        type: Boolean,
        default: false
    }
} , {
    timestamps : true
});

// Index for faster queries in the "Updates" section (filtering by receiver)
replySchema.index({ receiverEmail: 1, createdAt: -1 });

const Reply = model('Reply', replySchema);
module.exports = Reply;