const BlockedUsersFromApp = require("../models/BlockedFromApp");

exports.checkIfUserBlocked = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const doc = await BlockedUsersFromApp.findOne();

    if (!doc) {
      return res.json({ isBlocked: false });
    }

    const user = doc.blockedUsers.find((u) => u.email === email.toLowerCase());

    if (!user) {
      return res.json({ isBlocked: false });
    }

    return res.json({
      isBlocked: user.isPermanent,
      reportCount: user.count,
    });
  } catch (err) {
    console.error("CHECK BLOCK ERROR:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
