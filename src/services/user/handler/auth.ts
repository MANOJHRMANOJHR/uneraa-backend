import prisma from '../../../lib/prisma.js';
import bcrypt from 'bcrypt';
import { uploadOnCloudinary } from '../../../utils/cloudinary.js';
import { generateToken } from '../../../utils/jwt-token.js';
import {
  userLoginSchema,
  userRegisterSchema,
} from '../../../controllers/constrollersSchema.js';
import ApiError from '../../../utils/api-error.js';
import { StatusCode } from '../../../constants/statusCode.js';
import { getUniqueUserName } from '../../../utils/uniqueUserName.js';
import { AuthenticatedRequest } from '../../../controllers/types/user.type.js';

export const RegisterUser = async (body: any, files?: any) => {
  const { success, data, error } = userRegisterSchema.safeParse(body);

  if (!success) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      'Validation failed',
      error.errors
    );
  }

  const { name, email, password, bio } = data;

  const existingUser = await prisma.user.findFirst({ where: { email } });

  if (existingUser) {
    throw new ApiError(
      StatusCode.CONFLICT,
      'User already exists with this email'
    );
  }

  const profilePath = files?.profileImage?.[0]?.path;
  const coverPath = files?.coverImage?.[0]?.path;

  const profileImgUrl = profilePath
    ? (await uploadOnCloudinary(profilePath, 'profile Images'))?.url
    : '';
  const coverImgUrl = coverPath
    ? (await uploadOnCloudinary(coverPath, 'cover Images'))?.url
    : '';

  const uniqueUsername = await getUniqueUserName(email);
  const hashedPassword = await bcrypt.hash(password, 12);

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      bio,
      password: hashedPassword,
      username: uniqueUsername,
      profileImgUrl,
      coverImgUrl,
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

  return createdUser;
};

export const LoginUser = async (body: any) => {
  const { success, data, error } = userLoginSchema.safeParse(body);

  if (!success || !data) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      'Validation failed',
      error?.errors || []
    );
  }

  const { emailOrUsername, password } = data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user || !user.password) {
    throw new ApiError(StatusCode.NOT_FOUND, 'Invalid credentials');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid credentials');
  }

  const token = generateToken(user);

  return token;
};

export const LogoutUser = async (req: AuthenticatedRequest) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) {
    throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
  }

  return true;
};
