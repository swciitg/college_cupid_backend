const path = require('path');
const fs = require('fs');

exports.getImage = (req, res, next) => {
    const isPng = fs.existsSync(path.resolve(
        __dirname + '/../images/' + req.query.photoId + '.png'
    ));
    const extension = isPng ? '.png' : '.jpg';
    console.log(extension);
    const imagePath = path.resolve(
        __dirname + '/../images/' + req.query.photoId + extension
    );
    res.sendFile(imagePath);
};