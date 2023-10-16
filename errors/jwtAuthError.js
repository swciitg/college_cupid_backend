const { CustomError } = require("./customError");

exports.AccessTokenError =  class AccessTokenError extends CustomError{
    constructor(message){
        super(message, 401, "Access token error");
    }
}

exports.RefreshTokenError = class RefreshTokenError extends CustomError{
    constructor(message){
        super(message, 401, "Refresh token error");
    }
}