const SpeedDating = require("../models/SpeedDating.js");

exports.updateSpeedDating = async (req, res) => {
    const { active, startTime, timespan } = req.body;

    if (typeof active !== "boolean" || !startTime || !timespan) {
      return res.status(400).json({
        success: false,
        message: "active, startTime and timespan are required",
      });
    }

    let speedDating = await SpeedDating.findOne();

    if (!speedDating) {
      speedDating = new SpeedDating({
        active,
        startTime,
        timespan,
      });
    } else {
      speedDating.active = active;
      speedDating.startTime = startTime;
      speedDating.timespan = timespan;
    }

    await speedDating.save();

    return res.status(200).json({
      success: true,
      message: "Data updated successfully",
    });
};

exports.getSpeedDating = async (req, res) => {
    const speedDating = await SpeedDating.findOne();

    if (!speedDating) {
      return res.status(200).json({
        success: true ,
        active: false,
        startTime: null,
        timespan: null,
      });
    }

    return res.status(200).json({
      success : true,
      active: speedDating.active,
      startTime: speedDating.startTime,
      timespan: speedDating.timespan,
    });
};
  