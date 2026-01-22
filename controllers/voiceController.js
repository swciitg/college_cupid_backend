const fs = require("fs");
const path = require("path");
const User = require("../models/UserProfile.js");

const voiceDir = path.join(process.cwd(), "uploads", "voice");
if (!fs.existsSync(voiceDir)) {
  fs.mkdirSync(voiceDir, { recursive: true });
}

exports.uploadTempVoice = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  return res.json({
    tempPath: req.file.path,
    fileName: req.file.filename,
  });
};

exports.saveVoiceRecording = async (req, res) => {
  try {
    const { tempPaths, questions } = req.body;

    if (!tempPaths || !Array.isArray(tempPaths)) {
      return res.status(400).json({ error: "tempPaths must be array" });
    }

    const recordings = [];

    for (let i = 0; i < tempPaths.length; i++) {
      const tempPath = tempPaths[i];
      const fileName = path.basename(tempPath);
      const finalPath = path.join(voiceDir, fileName);

      await fs.promises.rename(tempPath, finalPath);

      recordings.push({
        question: questions?.[i] || "",
        answer: `/uploads/voice/${fileName}`,
      });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $push: { voiceRecordings: { $each: recordings } } },
    );

    return res.json({
      message: "Voice recordings saved",
      recordings,
    });
  } catch (err) {
    console.error("VOICE SAVE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
