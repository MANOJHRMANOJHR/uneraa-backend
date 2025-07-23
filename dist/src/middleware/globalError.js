import { StatusCode } from '../constants/statusCode.js';
import ApiResponce from '../utils/api-response.js';
export const globalErrorHandler = async (err, req, res, _next) => {
    const statusCode = err.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Something went wrong';
    const errors = err.errors || [];
    const errorInfo = {
        message,
        stack: err.stack,
        route: req.originalUrl,
        method: req.method,
        body: req.body, // include form data
    };
    // // Send alerts
    // await sendErrorToDiscord(errorInfo);
    // await sendErrorToEmail(errorInfo);
    return res
        .status(statusCode)
        .json(new ApiResponce(statusCode, false, message, errors));
};
