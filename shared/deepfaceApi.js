const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.callDeepFaceAPI = async (imgPath) => {
  try {
    const form = new FormData();
    form.append("img", fs.createReadStream(imgPath));

    const res = await axios.post(
      process.env.DEEPFACE_API_URL,
      form,
      { headers: form.getHeaders() }
    );

    return res.data;
  } 
  catch (err) {
    console.log("Error Message:", err.message);
    
   //allow user to proceed if deepface server is down
    return {
      human_present: true,
      fail_safe: true,
      reason: "DeepFace server unavailable"
    };
  }
};
