const { Schema, model } = require('mongoose');

const reportUserContentSchema = new Schema({
    'reportedByEmail': {
        type: String,
        required: [true, 'ReportedByEmail is a required field!']
    },
    'reportedEmail': {
        type: String,
        required: [true, 'ReportedEmail is a required field!'],
    },
    'reasonForReporting': {
        type: String,
        required: [true, 'Reason for reporting is not provided!']
    }
});

const ReportUserContent = model('ReportUserContent', reportUserContentSchema);
module.exports = ReportUserContent;