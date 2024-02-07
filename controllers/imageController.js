const path = require('path');
const fs = require('fs');
const compressImage = require('../middlewares/compressImage');

exports.getImage = (req, res, next) => {
    const isPng = fs.existsSync(path.resolve(
        __dirname + '/../images/' + req.query.photoId + '.png'
    ));
    const extension = isPng ? '.png' : '.jpg';
    const imagePath = path.resolve(
        __dirname + '/../images/' + req.query.photoId + extension
    );
    res.sendFile(imagePath);
};