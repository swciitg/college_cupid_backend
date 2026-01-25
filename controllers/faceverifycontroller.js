const { verifyFaceHandler } = require("../handlers/faceverifyHandler");

exports.verifyFace = async (req, res) => {
  try {
    const result = await verifyFaceHandler(req);

    if (result.human_present === true) {
      return res.status(200).json({
        success: true,
        message: "Human face detected in at least one photo.",
        human_present: true
      });
    }

    return res.status(200).json({
      success: false,
      message: "No human face detected in any photo.",
      human_present: false
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message
    });
  }
};
