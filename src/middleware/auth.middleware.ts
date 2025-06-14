import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { StatusCode } from '../constants/statusCode';
import ApiError from '../utils/api-error';
import prisma from '../lib/prisma';

const TOKEN_SECRET = process.env.JWT_SECRET || '';

export async function authorizeUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.access_token;

    if (!token) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json(
          new ApiError(
            StatusCode.UNAUTHORIZED,
            'Request Unauthorized. Token invalid'
          )
        );
      return;
    }

    const decodedToken = jwt.verify(token, TOKEN_SECRET);

    if (!decodedToken || typeof decodedToken != 'object') {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(new ApiError(StatusCode.BAD_REQUEST, 'Invalid Token'));
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decodedToken?.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        isObsolete: true,
      },
    });

    if (!user) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(
          new ApiError(StatusCode.NOT_FOUND, 'Invalid token. User not found')
        );
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Server error. Failed to authorize the user'
        )
      );
    return;
  }
}
