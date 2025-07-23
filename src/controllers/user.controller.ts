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
import prisma from '../lib/prisma.js';
import { userEditSchema, userFollowerSchema, UserEditInput, UserFollowerInput } from './constrollersSchema.js';
import { StatusCode } from '../constants/statusCode.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  userProfileSelect,
  userSummarySelect,
  UserProfileResponse,
  UserSummaryResponse,
  FollowResponse,
  AuthenticatedRequest 
} from './types/user.type.js';

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
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    const validationResult = userEditSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        'Validation failed',
        validationResult.error.errors
      );
    }

    const data = validationResult.data;
    const { name, bio, email, portfolioLink, username } = data;

    try {
      const [currentUser, existingEmail, existingUsername] = await Promise.all([
        prisma.user.findUnique({
          where: { id: currentUserId },
          select: { email: true, username: true },
        }),
        email && email !== req.user?.email
          ? prisma.user.findUnique({ where: { email } })
          : null,
        username
          ? prisma.user.findFirst({
              where: { username, NOT: { id: currentUserId } },
            })
          : null,
      ]);

      if (!currentUser) {
        throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
      }

      if (email && existingEmail) {
        throw new ApiError(StatusCode.CONFLICT, 'Email already exists');
      }

      if (username && existingUsername) {
        throw new ApiError(StatusCode.CONFLICT, 'Username already exists');
      }

      const updatedUser = await prisma.user.update({
        where: { id: currentUserId },
        data: { name, bio, email, portfolioLink, username },
        select: userProfileSelect,
      });

      return new ApiResponse(
        StatusCode.OK,
        true,
        'User updated successfully',
        updatedUser as UserProfileResponse
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get user by ID
   */
  @Get('{userId}')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'User not found')
  public async getUserById(
    @Path() userId: string
  ): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userProfileSelect,
      });

      if (!user) {
        throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
      }

      return new ApiResponse(
        StatusCode.OK,
        true,
        'User fetched successfully',
        user as UserProfileResponse
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
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
    if (req.user?.id !== userId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    try {
      await prisma.user.delete({ where: { id: userId } });
      return new ApiResponse(
        StatusCode.NO_CONTENT,
        true,
        'User deleted successfully',
        {}
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get users with pagination
   */
  @Get()
  public async getUsers(
    @Query() limit: number = 10,
    @Query() skip: number = 0
  ): Promise<ApiResponse<UserSummaryResponse[]>> {
    try {
      const users = await prisma.user.findMany({
        where: { isObsolete: false },
        select: userSummarySelect,
        take: limit,
        skip: skip,
      });

      return new ApiResponse(
        StatusCode.OK,
        true,
        'Users fetched successfully',
        users as UserSummaryResponse[]
      );
    } catch (error) {
      throw new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'Internal server error',
        error instanceof Error ? [error.message] : []
      );
    }
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
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    const validationResult = userFollowerSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        'Validation failed',
        validationResult.error.errors
      );
    }

    const { followingId } = validationResult.data;
    const followerId = currentUserId;

    try {
      // Check if users exist in single query
      const usersExist = await prisma.user.count({
        where: { OR: [{ id: followerId }, { id: followingId }] },
      });

      if (usersExist !== 2) {
        throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
      }

      // Check existing follow relationship
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });

      let isFollowing: boolean;
      let message: string;

      if (existingFollow) {
        await prisma.follow.delete({
          where: {
            followerId_followingId: { followerId, followingId },
          },
        });
        isFollowing = false;
        message = 'Unfollowed user successfully';
      } else {
        await prisma.follow.create({
          data: { followerId, followingId },
        });
        isFollowing = true;
        message = 'Followed user successfully';
      }

      return new ApiResponse(StatusCode.OK, true, message, {
        message,
        isFollowing,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Centralized Prisma error handler
   */
  private handlePrismaError(error: unknown): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
        case 'P2002':
          throw new ApiError(StatusCode.CONFLICT, 'Database conflict error');
        default:
          throw new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            'Database error',
            [error.message]
          );
      }
    }

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      'Internal server error',
      error instanceof Error ? [error.message] : []
    );
  }
}