const { Schema, model } = require('mongoose');

const crushesCountSchema = new Schema({
    'email': {
        type: String,
        unique: true,
        required: [true, 'Email is a required field!']
    },
    'crushesCount': {
        type: Number,
        default: 0
    }
});

const CrushesCount = model('CrushesCount', crushesCountSchema);
module.exports = CrushesCount;