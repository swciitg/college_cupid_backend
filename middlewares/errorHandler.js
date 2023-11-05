const {CustomError} = require('../errors/customError');

exports.errorHandler = (err, req, res, next) => {
    console.log('error handler');
    if(err instanceof CustomError){
        res.status(err.statusCode).json({message: err.message, error: err.name});
    } else {
        res.status(500).json({message: err.message, error: 'Internal server error'});
    }
}