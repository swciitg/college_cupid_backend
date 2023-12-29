const { CustomError } = require("./customError");

exports.ForbiddenResourceError = class RequestValidationError extends CustomError{
    constructor(message){
        super(message, 403, 'Forbidden');
    }
}