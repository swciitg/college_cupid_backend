const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

module.exports = async(req, res, next) => {
    if(req.imageUrl === undefined){
        console.log('hereerere');
        return next();
    }
    console.log('here');
    const imagePath = path.resolve(__dirname + '/../images/' + req.imageId + '.jpg');
    const compressedImageURL = process.env.BASE_URL + process.env.API_URL + 
        '/getImage?photoId=' + req.imageId + '-compressed';
    const compressedImagePath = path.resolve(
        __dirname +
        "/../images/" +
        req.imageId +
        "-compressed.jpg"
    );
    const metadata = await sharp(imagePath).metadata();
    await sharp(imagePath)
        .resize({
            height: metadata.height < 1000 ? metadata.height : 1000,
            width: metadata.height < 1000 ? metadata.width : Math.floor((metadata.width/metadata.height)*1000)
        })
        .withMetadata()
        .toFile(compressedImagePath);
    fs.unlinkSync(imagePath);
    req.imageUrl = compressedImageURL;
    
    next();
}