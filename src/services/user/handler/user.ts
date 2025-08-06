import prisma from '../../../lib/prisma.js';
import {
  userEditSchema,
  userFollowerSchema,
  UserEditInput,
  UserFollowerInput,
} from '../schema.js';
import { StatusCode } from '../../../constants/statusCode.js';
import ApiError from '../../../utils/api-error.js';
import ApiResponse from '../../../utils/api-response.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  userProfileSelect,
  userSummarySelect,
  UserProfileResponse,
  UserSummaryResponse,
  FollowResponse,
  AuthenticatedRequest,
} from '../types.js';

export const UpdateUserProfile = async (
  req: AuthenticatedRequest,
  body: UserEditInput
) => {
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
    if (error instanceof PrismaClientKnownRequestError) {
      throw new ApiError(StatusCode.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error as any[]
    );
  }
};

export const GetUser = async (userId: string) => {
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
    if (error instanceof PrismaClientKnownRequestError) {
      throw new ApiError(StatusCode.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error as any[]
    );
  }
};

export const GetUsers = async (limit: number, skip: number) => {
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
};

export const DeleteUser = async (req: AuthenticatedRequest, userId: string) => {
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
    if (error instanceof PrismaClientKnownRequestError) {
      throw new ApiError(StatusCode.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      error as any[]
    );
  }
};

export const FollowUser = async (
  req: AuthenticatedRequest,
  body: UserFollowerInput
) => {
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
    if (error instanceof PrismaClientKnownRequestError) {
      throw new ApiError(StatusCode.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      [(error as Error).message]
    );
  }
};
