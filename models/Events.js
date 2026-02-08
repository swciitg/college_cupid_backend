const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    route : {
        type: String ,
        default : null
    } ,
    startsAt: {
        type: Date
    },
    endsAt: {
        type: Date
    }
}, { 
    timestamps: true 
});

const Event = model('Event', eventSchema);
module.exports = Event;
