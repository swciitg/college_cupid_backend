const cloudinary = require("cloudinary").v2;

// File Upload
async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });
    return res;
}

exports.uploadImage = async (req) => {
    if(req.file){
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);
        console.log(cldRes.url);
        var url = cldRes.url;
        return url;
    }
}