const { Schema, model } = require('mongoose');

const speedDatingSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      required : [true, 'Start time is required!'],
    },
    endTime: {
      type: Date,
      required : [true, 'End time is required!'],
    }
},
{timestamps :   true}
);

const SpeedDating = model("SpeedDating", speedDatingSchema);
module.exports = SpeedDating;