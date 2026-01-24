const { callDeepFaceAPI } = require("../shared/deepfaceApi.js");
const fs = require("fs");
const path = require("path");

exports.verifyFaceHandler = async (req) => {
  const { photoIds } = req.body; 

  if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
    throw new Error("photoIds array is required.");
  }

  for (const id of photoIds) {
    const imagePath = path.resolve("images", `${id}.jpg`);

    if (!fs.existsSync(imagePath)) continue;

    try {
      const result = await callDeepFaceAPI(imagePath);

      if (result.human_present === true) {
        return {
           human_present: true
           };
      }

    } catch (err) {
      console.log("DeepFace error for:", id, err);
      continue;
    }
  }

  return { human_present: false };
};
