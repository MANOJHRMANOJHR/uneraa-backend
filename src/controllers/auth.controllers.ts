import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  Request,
  Security,
  Response,
  UploadedFiles
} from 'tsoa';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { generateToken } from '../utils/jwt-token';
import { userLoginSchema, userRegisterSchema } from './constrollersSchema';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import { StatusCode } from '../constants/statusCode';
import { getUniqueUserName } from '../utils/uniqueUserName';
import { AuthenticatedRequest } from './types/user.type';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  private secure = process.env.ENVIRONMENT !== 'development';

  /**
   * Register a new user
   */
  @Post('/register')
  @Response<ApiError>(StatusCode.CONFLICT, 'User already exists')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  public async registerUser(
    @Request() req: ExpressRequest,
    @UploadedFiles() files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    }
  ): Promise<ApiResponse<any>> {
    const { success, data, error } = userRegisterSchema.safeParse(req.body);

    if (!success) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Validation failed', error.errors);
    }

    const { name, email, password, bio } = data;

    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      throw new ApiError(StatusCode.CONFLICT, 'User already exists with this email');
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

    return new ApiResponse(StatusCode.OK, true, 'User registered successfully', createdUser);
  }

  /**
   * Login a user
   */
  @Post('/login')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Invalid credentials')
  public async loginUser(@Request() req: ExpressRequest): Promise<ApiResponse<any>> {
    const { success, data, error } = userLoginSchema.safeParse(req.body);

    if (!success || !data) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Validation failed', error?.errors || []);
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

    // Set cookie manually since we're using tsoa (outside of typical middleware)
    (req as any).res?.cookie('auth_token', token, {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'strict',
    });

    return new ApiResponse(StatusCode.OK, true, 'Signed in successfully', token);
  }

  /**
   * Logout a user
   */
  @Post('/logout')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  public async logoutUser(@Request() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    const userEmail = req.user?.email;

    if (!userEmail) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
    }

    (req as any).res?.clearCookie('auth_token', {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'strict',
    });

    return new ApiResponse(StatusCode.OK, true, 'User logged out successfully', {});
  }
}
