import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import ApiResponse from '../utils/api-response';
import ApiError from '../utils/api-error';
import { uploadOnCloudinary } from '../utils/cloudinary';
import bcrypt from 'bcrypt';
import { StatusCode } from '../constants/statusCode';
import { userRegisterSchema } from './constrollersSchema';
import { getUniqueUserName } from '../utils/uniqueUserName';

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
      console.log('after returning');
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.profileImage.length > 0
      ) {
        profileImgLocalPath = req.files.profileImage[0].path;
      }
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
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
      const createdUser = await prisma.user.create({
        data: {
          name,
          email,
          bio,
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

export default { registerUser };
