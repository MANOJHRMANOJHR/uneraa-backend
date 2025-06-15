import prisma from '../lib/prisma';
import { CookieOptions, Request, Response } from 'express';
import ApiResponse from '../utils/api-response';
import ApiError from '../utils/api-error';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { StatusCode } from '../constants/statusCode';
import { userLoginSchema, userRegisterSchema } from './constrollersSchema';
import { getUniqueUserName } from '../utils/uniqueUserName';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt-token';

const secureEnvironment =
  process.env.ENVIRONMENT === 'development' ? false : true;

const registerUser = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = userRegisterSchema.safeParse(req.body);

    if (success) {
      const { name, email, password, bio } = data;
      let profileImgLocalPath, coverImgLocalPath;
      let profileImgUrl, coverImgUrl;

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (existingUser) {
        res
          .status(StatusCode.CONFLICT)
          .json(
            new ApiError(
              StatusCode.CONFLICT,
              'User already exist with this email'
            )
          );
        return;
      }
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.profileImage &&
        req.files.profileImage.length > 0
      ) {
        profileImgLocalPath = req.files.profileImage[0].path;
      }
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.coverImage &&
        req.files.coverImage.length > 0
      ) {
        coverImgLocalPath = req.files.coverImage[0].path;
      }

      if (profileImgLocalPath) {
        profileImgUrl = await uploadOnCloudinary(
          profileImgLocalPath,
          'profile Images'
        );
      }
      if (coverImgLocalPath) {
        coverImgUrl = await uploadOnCloudinary(
          coverImgLocalPath,
          'Cover Images'
        );
      }

      const uniqueUsername = await getUniqueUserName(email);

      const hashedPassword = await bcrypt.hash(password, 12);

      const createdUser = await prisma.user.create({
        data: {
          name,
          email,
          bio,
          password: hashedPassword,
          username: uniqueUsername,
          profileImgUrl: profileImgUrl?.url || '',
          coverImgUrl: coverImgUrl?.url || '',
        },
        select: {
          name: true,
          email: true,
          bio: true,
          profileImgUrl: true,
          coverImgUrl: true,
          CreatedAt: true,
          UpdatedAt: true,
        },
      });

      res
        .status(StatusCode.OK)
        .json(
          new ApiResponse(StatusCode.OK, true, 'Fetched success', createdUser)
        );
      return;
    } else {
      res.status(StatusCode.BAD_REQUEST).json({
        statsuCode: StatusCode.BAD_REQUEST,
        message: 'Input Validation failed',
        error: error,
      });
      return;
    }
  } catch (error) {
    console.log('error in catch', error);

    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Internal Server Error',
          [error]
        )
      );
    return;
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    console.log('body', req.body);
    const { success, data, error } = userLoginSchema.safeParse(req.body);

    if (error) {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(
          new ApiError(StatusCode.BAD_REQUEST, 'Input validation failed', [
            error,
          ])
        );
      return;
    }

    if (success && data) {
      const { emailOrUsername, password } = data;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: emailOrUsername,
            },
            {
              username: emailOrUsername,
            },
          ],
        },
      });

      if (!user || !user.password) {
        res
          .status(StatusCode.NOT_FOUND)
          .json(new ApiError(StatusCode.NOT_FOUND, 'Invalid Credentials'));
        return;
      }

      const isCorrectPassword = await bcrypt.compare(password, user?.password);

      if (isCorrectPassword) {
        const token = generateToken(user);

        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: secureEnvironment,
          sameSite: 'strict',
        });

        res
          .status(StatusCode.OK)
          .json(
            new ApiResponse(
              StatusCode.OK,
              true,
              'Signed in successfully',
              token
            )
          );
        return;
      } else {
        res
          .status(StatusCode.BAD_REQUEST)
          .json(new ApiError(StatusCode.BAD_REQUEST, 'Invalid Credentials'));
        return;
      }
    }
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Operation failed. Internal server error'
        )
      );
    return;
  }
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiError(StatusCode.NOT_FOUND, 'User not found'));
      return;
    }

    const options: CookieOptions = {
      httpOnly: true,
      secure: secureEnvironment,
      sameSite: 'strict',
    };

    res
      .status(StatusCode.OK)
      .clearCookie('auth_token', options)
      .json(
        new ApiResponse(StatusCode.OK, true, 'User loggedout Successfully', {})
      );
    return;
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Internal server error',
          [error]
        )
      );
  }
};

export default { registerUser, loginUser, logoutUser };
