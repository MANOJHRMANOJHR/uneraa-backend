import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { StatusCode } from '../constants/statusCode.js';
import ApiError from '../utils/api-error.js';
import prisma from '../lib/prisma.js';

const TOKEN_SECRET = process.env.JWT_SECRET || '';

export async function authorizeUser(
  req: Request,
  name: string,
  _scheme: unknown,
  res: Response,
  next: NextFunction
) {
  try {
    const tokenArr = req.headers.authorization?.split(' ');

    if (!tokenArr || tokenArr.length < 2) {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(new ApiError(StatusCode.BAD_REQUEST, 'Invalid token'));
      return;
    }

    const token = tokenArr[1] || req.cookies?.access_token;

    console.log('token', token);

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
    console.log('error in auth', error);
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

export async function expressAuthentication(
  request: Request,
  securityName: string
): Promise<any> {
  if (securityName === 'jwt') {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, TOKEN_SECRET);

      if (typeof decoded !== 'object' || !decoded.id) {
        throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid token payload');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      });

      if (!user) {
        throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
      }

      return user; // this will be available in controller as request.user
    } catch (error) {
      console.log('error:', error);
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Invalid or expired token');
    }
  }

  throw new ApiError(StatusCode.UNAUTHORIZED, 'Unknown security scheme');
}
