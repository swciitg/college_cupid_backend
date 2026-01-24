const multer = require("multer");
const path = require("path");
const fs = require("fs");

// create temp directory if not exists
const voiceDir = path.join(process.cwd(), "uploads", "voice");
if (!fs.existsSync(voiceDir)) {
  fs.mkdirSync(voiceDir, { recursive: true });
}

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, voiceDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || "guest";
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".webm";

    cb(null, `${userId}_${timestamp}_${random}${ext}`);
  },
});

// multer instance
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("audio/")) {
      return cb(new Error("Only audio files allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
