import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  Request,
  Security,
  Response,
  UploadedFiles,
} from 'tsoa';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';
import { StatusCode } from '../constants/statusCode.js';
import { AuthenticatedRequest } from './types/user.type.js';
import {
  LoginUser,
  LogoutUser,
  RegisterUser,
} from '../services/user/handler/auth.js';

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
    @UploadedFiles()
    files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    }
  ): Promise<ApiResponse<any>> {
    const createdUser = await RegisterUser(req.body, files);

    return new ApiResponse(
      StatusCode.OK,
      true,
      'User registered successfully',
      createdUser
    );
  }

  /**
   * Login a user
   */
  @Post('/login')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Invalid credentials')
  public async loginUser(
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<any>> {
    const token = await LoginUser(req.body);

    // Set cookie manually since we're using tsoa (outside of typical middleware)
    (req as any).res?.cookie('auth_token', token, {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'strict',
    });

    return new ApiResponse(
      StatusCode.OK,
      true,
      'Signed in successfully',
      token
    );
  }

  /**
   * Logout a user
   */
  @Post('/logout')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  public async logoutUser(
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    await LogoutUser(req);
    (req as any).res?.clearCookie('auth_token', {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'strict',
    });

    return new ApiResponse(
      StatusCode.OK,
      true,
      'User logged out successfully',
      {}
    );
  }
}
