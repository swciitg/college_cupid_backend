const { CustomError } = require("./customError");

exports.NotFoundError = class NotFoundError extends CustomError{
    constructor(message){
        super(message, 404, "Not Found Error");
    }
}