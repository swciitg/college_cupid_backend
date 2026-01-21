const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const fs = require("fs");
const path = require("path");

// upload temp
router.post("/upload-temp", upload.single("voice"), (req, res) => {
  res.json({
    tempPath: req.file.path,
    fileName: req.file.filename,
  });
});

// move to permanent
router.post("/voice", (req, res) => {
  const { tempPaths } = req.body;

  const finalPaths = tempPaths.map((tempPath) => {
    const fileName = path.basename(tempPath);
    const finalPath = path.join("uploads/voice", fileName);
    fs.renameSync(tempPath, finalPath);
    return finalPath;
  });

  res.json({
    message: "Saved permanently",
    files: finalPaths,
  });
});

module.exports = router;
