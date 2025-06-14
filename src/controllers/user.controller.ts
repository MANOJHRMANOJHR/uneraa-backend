import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { userEditSchema, userFollowerSchema } from './constrollersSchema';
import { StatusCode } from '../constants/statusCode';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';

declare global {
  namespace Express {
    interface User {
      email?: string;
    }
  }
}

const updateUserProfileData = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const { success, data, error } = userEditSchema.safeParse(req.body);
    if (success) {
      const { name, bio, email, portfolioLink, username } = data;

      if (email) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (existingEmail) {
          res
            .status(StatusCode.CONFLICT)
            .json(new ApiError(StatusCode.CONFLICT, 'Email already exist'));
          return;
        }
      }

      if (username) {
        const existingUsername = await prisma.user.findFirst({
          where: {
            username,
          },
        });

        if (existingUsername) {
          res
            .status(StatusCode.CONFLICT)
            .json(new ApiError(StatusCode.CONFLICT, 'Username already exist'));
          return;
        }
      }

      const updatedUser = await prisma.user.update({
        where: {
          email: userEmail,
        },
        data: {
          name,
          bio,
          email,
          portfolioLink,
        },
      });

      if (!updatedUser) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json(
            new ApiError(
              StatusCode.INTERNAL_SERVER_ERROR,
              'Failed to update data'
            )
          );
        return;
      }

      res
        .status(StatusCode.OK)
        .json(
          new ApiResponse(
            StatusCode.OK,
            true,
            'Data updated successfully',
            updatedUser
          )
        );
      return;
    } else {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(
          new ApiError(StatusCode.BAD_REQUEST, 'Data validation failed', [
            error,
          ])
        );
      return;
    }
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Server error', [error])
      );
    return;
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const ExistingUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!ExistingUser) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiError(StatusCode.NOT_FOUND, 'User not found'));
      return;
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          true,
          'User fetched successfully',
          ExistingUser
        )
      );
    return;
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Server error while fetching user',
          [error]
        )
      );
    return;
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const ExistingUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!ExistingUser) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiError(StatusCode.NOT_FOUND, 'User not found'));
      return;
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res
      .status(StatusCode.NO_CONTENT)
      .json(
        new ApiResponse(
          StatusCode.NO_CONTENT,
          true,
          'User Deleted successfully',
          ExistingUser
        )
      );
    return;
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Server error while delete operation',
          [error]
        )
      );
    return;
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const skip = parseInt(req.params.skip) || 0;

    const Users = await prisma.user.findMany({
      where: {
        isObsolete: false,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        profileImgUrl: true,
        coverImgUrl: true,
        bio: true,
        techStack: true,
      },
      take: limit,
      skip: skip,
    });

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          true,
          'Users fetched successfully',
          Users
        )
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
    return;
  }
};

//follow and unfollow operation handled in single route automatically
const followUser = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = userFollowerSchema.safeParse(req.body);

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
      const { followerId, followingId } = data;

      const follower = await prisma.user.findUnique({
        where: {
          id: followerId,
        },
        include: {
          followers: true,
          following: true,
        },
      });

      if (!follower) {
        res
          .status(StatusCode.NOT_FOUND)
          .json(new ApiError(StatusCode.NOT_FOUND, 'Not a valid user'));
        return;
      }

      const alreadyFollwing = await prisma.user.findFirst({
        where: {
          id: followerId,
          following: {
            some: {
              id: followingId,
            },
          },
        },
      });

      //follow unfollow conditionally in single route
      if (alreadyFollwing) {
        const updateFollwerList = await prisma.user.update({
          where: {
            id: followingId,
          },
          data: {
            followers: {
              disconnect: {
                id: followerId,
              },
            },
          },
        });

        const updateFollwingList = await prisma.user.update({
          where: {
            id: followerId,
          },
          data: {
            following: {
              disconnect: { id: followingId },
            },
          },
        });

        res
          .status(StatusCode.OK)
          .json(
            new ApiResponse(
              StatusCode.OK,
              true,
              'Unfollwed user successfully',
              { updateFollwerList, updateFollwingList }
            )
          );
        return;
      } else {
        const updateFollwerList = await prisma.user.update({
          where: {
            id: followingId,
          },
          data: {
            followers: {
              connect: {
                id: followerId,
              },
            },
          },
        });

        const updateFollwingList = await prisma.user.update({
          where: {
            id: followerId,
          },
          data: {
            following: {
              connect: {
                id: followingId,
              },
            },
          },
        });

        res.status(StatusCode.OK).json(
          new ApiResponse(StatusCode.OK, true, 'Follwed user successfully', {
            updateFollwerList,
            updateFollwingList,
          })
        );
        return;
      }
    }
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'Operation failed. Internal server error',
          [error]
        )
      );
    return;
  }
};

export default {
  updateUserProfileData,
  getUserById,
  deleteUser,
  getUsers,
  followUser,
};
