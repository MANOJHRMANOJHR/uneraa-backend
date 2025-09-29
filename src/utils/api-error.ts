class ApiError extends Error {
  statusCode: number;
  message: string;
  errors: any[] = [];

  constructor(
    statusCode: number,
    message: string,
    errors: any[] = [],
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      if (typeof (Error as any).captureStackTrace === 'function') {
        (Error as any).captureStackTrace(this, this.constructor); // capture original stack
      }
    }
  }
}

export default ApiError;
