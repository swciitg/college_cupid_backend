const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

exports.getImage = async(req, res, next) => {
    // INITIALLY WE WERE USING PNG IMAGES
    // THIS CODE COMPRESSES THE PNG IMAGES AS THEY WERE NOT COMPRESSED WHILE UPLOADING
    // AND SAVES THEM IN JPG FORMAT AS THEY ARE LIGHTER
    
    // const isPng = fs.existsSync(path.resolve(
    //     __dirname + '/../images/' + req.query.photoId + '.png'
    // ));
    // if(isPng){
    //     const imagePath = path.resolve(
    //         __dirname + '/../images/' + req.query.photoId + '.png'
    //     );
    //     const jpgImagePath = path.resolve(
    //         __dirname + '/../images/' + req.query.photoId + '.jpg'
    //     );
        
    //     const compressedImagePath = path.resolve(
    //         __dirname +
    //         "/../images/" +
    //         req.query.photoId +
    //         "-compressed.jpg"
    //     );
    //     const metadata = await sharp(imagePath).metadata();
    //     await sharp(imagePath)
    //         .resize({
    //             height: metadata.height < 1000 ? metadata.height : 1000,
    //             width: metadata.height < 1000 ? metadata.width 
    //                 : Math.floor((metadata.width/metadata.height)*1000)
    //         })
    //         .withMetadata()
    //         .toFile(compressedImagePath);
    //     fs.unlinkSync(imagePath);
    //     fs.rename(compressedImagePath, jpgImagePath, ()=>{
    //         console.log('File Renamed');
    //     });
    //     return res.sendFile(jpgImagePath);
    // }

    const imagePath = path.resolve(
        __dirname + '/../images/' + req.query.photoId + '.jpg'
    );
    res.sendFile(imagePath);
};