const { RequestValidationError } = require("../errors/requestValidationError");

module.exports = (req, res, next) => {
    if (req.headers["security-key"] !== process.env.SECURITY_KEY) {
        next(new RequestValidationError("Unauthorized user"));
    }
    next();
}