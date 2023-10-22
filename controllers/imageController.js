const path = require('path');

exports.getImage = async(req, res) => {
    const imagePath = path.resolve(
        __dirname + '/../images/' + req.query.photoId + '.png'
    );
    console.log(imagePath);
    res.sendFile(imagePath);
};