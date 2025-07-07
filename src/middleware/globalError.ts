import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error';
import { sendErrorToDiscord, sendErrorToEmail } from '../utils/notifier';
import { StatusCode } from '../constants/statusCode';
import ApiResponce from '../utils/api-response';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      email?: string;
    }
  }
}

export const globalErrorHandler = async (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
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
