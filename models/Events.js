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
    },
    event_type: {
        type: String,
        enum: ['BLIND_DATING', 'OTHER'],
        default: 'OTHER'
    },
    startTime: {
        type: String, // Daily start time in 24-hour format like "23:00" for 11 PM
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Validates HH:MM format
    },
    endTime: {
        type: String, // Daily end time in 24-hour format like "02:00" for 2 AM
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Validates HH:MM format
    }
}, { 
    timestamps: true
});

const Event = model('Event', eventSchema);
module.exports = Event;
