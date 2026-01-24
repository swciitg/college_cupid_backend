const axios =  require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.callDeepFaceAPI = async (imgPath) => {
  const form = new FormData();

  form.append("img", fs.createReadStream(imgPath));
 
  const res = await axios.post(
    "http://127.0.0.1:5001/face/verify/",
    form,
    { headers: form.getHeaders() }
  );
  return res.data;
}
