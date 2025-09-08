import {
  Controller,
  Get,
  Route,
  Tags,
  Patch,
  Delete,
  Body,
  Path,
  Query,
  Security,
  Request,
  Post,
  Response,
} from 'tsoa';
import { UserEditInput, UserFollowerInput } from './schema.js';
import { StatusCode } from '../../constants/statusCode.js';
import ApiError from '../../utils/api-error.js';
import ApiResponse from '../../utils/api-response.js';
import {
  UserProfileResponse,
  UserSummaryResponse,
  FollowResponse,
  AuthenticatedRequest,
} from './types.js';
import {
  DeleteUser,
  FollowUser,
  GetUser,
  GetUsers,
  UpdateUserProfile,
} from './handler/user.js';

@Route('user')
@Tags('User')
export class UserController extends Controller {
  /**
   * Update user profile
   */
  @Patch('update')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  @Response<ApiError>(StatusCode.CONFLICT, 'Email or username already exists')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'User not found')
  public async updateUserProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: UserEditInput
  ): Promise<ApiResponse<UserProfileResponse>> {
    return await UpdateUserProfile(req, body);
  }

  /**
   * Get user by ID
   */
  @Get('{userId}')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'User not found')
  public async getUserById(
    @Path() userId: string
  ): Promise<ApiResponse<UserProfileResponse>> {
    return await GetUser(userId);
  }

  /**
   * Delete user
   */
  @Delete('{userId}')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'User not found')
  public async deleteUser(
    @Request() req: AuthenticatedRequest,
    @Path() userId: string
  ): Promise<ApiResponse<{}>> {
    return await DeleteUser(req, userId);
  }

  /**
   * Get users with pagination
   */
  @Get()
  public async getUsers(
    @Query() limit: number = 10,
    @Query() skip: number = 0
  ): Promise<ApiResponse<UserSummaryResponse[]>> {
    return await GetUsers(limit, skip);
  }

  /**
   * Follow or unfollow a user
   */
  @Post('follow')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'User not found')
  public async followUser(
    @Request() req: AuthenticatedRequest,
    @Body() body: UserFollowerInput
  ): Promise<ApiResponse<FollowResponse>> {
    return await FollowUser(req, body);
  }

  /**
   * Centralized Prisma error handler
   */

  // private handlePrismaError(error: unknown): never {
  //   if (error instanceof PrismaClientKnownRequestError) {
  //     switch (error.code) {
  //       case 'P2025':
  //         throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
  //       case 'P2002':
  //         throw new ApiError(StatusCode.CONFLICT, 'Database conflict error');
  //       default:
  //         throw new ApiError(
  //           StatusCode.INTERNAL_SERVER_ERROR,
  //           'Database error',
  //           [error.message]
  //         );
  //     }
  //   }

  //   if (error instanceof ApiError) throw error;

  //   throw new ApiError(
  //     StatusCode.INTERNAL_SERVER_ERROR,
  //     'Internal server error',
  //     error instanceof Error ? [error.message] : []
  //   );
  // }
}
