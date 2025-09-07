import { Request, Response, NextFunction } from 'express';

export function AsyncHandler(
  requestHandler: (req: Request, res: Response, next: NextFunction) => any
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(function (
      error: any
    ) {
      next(error);
    });
  };
}
