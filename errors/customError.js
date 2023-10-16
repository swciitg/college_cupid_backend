exports.CustomError = class CustomError extends Error{
    constructor(message, statusCode, name){
        super(message);
        this.statusCode = statusCode;
        this.name = name;
    }
}