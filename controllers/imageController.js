const path = require('path');

exports.getImage = (req, res, next) => {
    const imagePath = path.resolve(
        __dirname + '/../images/' + req.query.photoId + '.png'
    );
    res.sendFile(imagePath);
};