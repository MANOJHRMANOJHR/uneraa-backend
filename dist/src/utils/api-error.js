class ApiError extends Error {
    statusCode;
    message;
    errors = [];
    constructor(statusCode, message, errors = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            if (typeof Error.captureStackTrace === 'function') {
                Error.captureStackTrace(this, this.constructor); // capture original stack
            }
        }
    }
}
export default ApiError;
