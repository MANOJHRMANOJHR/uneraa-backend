import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import ApiResponse from '../utils/api-response';
import z from 'zod';
import ApiError from '../utils/api-error';
import { uploadOnCloudinary } from '../utils/cloudinary';
import bcrypt from 'bcrypt';

export const userRegisterSchema = z.object({
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(20),
  bio: z.string().max(700),
});

const registerUser = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = userRegisterSchema.safeParse(req.body);

    if (success) {
      const { firstName, lastName, email, password, bio } = data;
      let profileImgLocalPath, coverImgLocalPath;
      let profileImgUrl, coverImgUrl;

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (existingUser) {
        res
          .status(400)
          .json(new ApiError(400, 'User already exist with this email'));
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

      const hasedPassword = await bcrypt.hash(password, 13);

      const createdUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hasedPassword,
          bio,
          profileImgUrl: profileImgUrl?.url || '',
          coverImgUrl: coverImgUrl?.url || '',
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
          profileImgUrl: true,
          coverImgUrl: true,
          CreatedAt: true,
          UpdatedAt: true,
        },
      });

      res
        .status(200)
        .json(new ApiResponse(200, true, 'Fetched success', createdUser));
      return;
    } else {
      res.status(400).json({
        statsuCode: 400,
        message: 'Input Validation failed',
        error: error,
      });
      return;
    }
  } catch (error) {
    console.log('error in catch', error);

    res.status(500).json(new ApiError(500, 'Internal Server Error', [error]));
    return;
  }
};

export default { registerUser };
