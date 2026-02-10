const BlockedUsersFromApp = require("../models/BlockedFromApp");

exports.checkIfUserBlocked = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const doc = await BlockedUsersFromApp.findOne({email: email});

    if (!doc) {
      return res.json({ isBlocked: false });
    }

    return res.json({
      isBlocked: doc.isPermanent,
      reportCount: doc.count,
    });
  } catch (err) {
    console.error("CHECK BLOCK ERROR:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
