const SpeedDating = require("../models/SpeedDating");

exports.updateSpeedDating = async (req, res) => {
    const { active, startTime, endTime } = req.body;

    if (typeof active !== "boolean" || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "active, startTime and endTime are required",
      });
    }

    let speedDating = await SpeedDating.findOne();

    if (!speedDating) {
      speedDating = new SpeedDating({
        active,
        startTime,
        endTime,
      });
    } else {
      speedDating.active = active;
      speedDating.startTime = startTime;
      speedDating.endTime = endTime;
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
        active: false,
        startTime: null,
        endTime: null,
      });
    }

    return res.status(200).json({
      active: speedDating.active,
      startTime: speedDating.startTime,
      endTime: speedDating.endTime,
    });
};
  