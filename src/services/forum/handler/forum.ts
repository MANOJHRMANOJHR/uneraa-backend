import prisma from '../../../lib/prisma.js';
import {
  forumSchema,
  forumUpdateSchema,
  ForumInput,
  ForumUpdateInput,
} from '../schema.js';
import { StatusCode } from '../../../constants/statusCode.js';
import ApiError from '../../../utils/api-error.js';
import ApiResponse from '../../../utils/api-response.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  forumSelect,
  forumSummarySelect,
  ForumResponse,
  ForumSummaryResponse,
  AuthenticatedRequest,
} from '../types.js';

/**
 * Create Forum
 */
export const CreateForum = async (
  req: AuthenticatedRequest,
  body: ForumInput
) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
  }

  const validationResult = forumSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      'Validation failed',
      validationResult.error.errors
    );
  }

  try {
    const forum = await prisma.forum.create({
      data: {
        title: validationResult.data.title,
        description: validationResult.data.description,
        createdById: userId,
      },
      select: forumSelect,
    });

    return new ApiResponse(
      StatusCode.CREATED,
      true,
      'Forum created successfully',
      forum as ForumResponse
    );
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

/**
 * Update Forum
 */
export const UpdateForum = async (
  req: AuthenticatedRequest,
  forumId: string,
  body: ForumUpdateInput
) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');

  const validationResult = forumUpdateSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      'Validation failed',
      validationResult.error.errors
    );
  }

  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      select: { id: true, createdById: true },
    });

    if (!forum) {
      throw new ApiError(StatusCode.NOT_FOUND, 'Forum not found');
    }

    if (forum.createdById !== userId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'You cannot edit this forum');
    }

    const updatedForum = await prisma.forum.update({
      where: { id: forumId },
      data: validationResult.data,
      select: forumSelect,
    });

    return new ApiResponse(
      StatusCode.OK,
      true,
      'Forum updated successfully',
      updatedForum as ForumResponse
    );
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

/**
 * Delete Forum
 */
export const DeleteForum = async (
  req: AuthenticatedRequest,
  forumId: string
) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');

  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      select: { id: true, createdById: true },
    });

    if (!forum) {
      throw new ApiError(StatusCode.NOT_FOUND, 'Forum not found');
    }

    if (forum.createdById !== userId) {
      throw new ApiError(
        StatusCode.UNAUTHORIZED,
        'You cannot delete this forum'
      );
    }

    await prisma.forum.delete({ where: { id: forumId } });

    return new ApiResponse(StatusCode.NO_CONTENT, true, 'Forum deleted', {});
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

/**
 * Get Forum by ID
 */
export const GetForumById = async (forumId: string) => {
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      select: forumSelect,
    });

    if (!forum) {
      throw new ApiError(StatusCode.NOT_FOUND, 'Forum not found');
    }

    return new ApiResponse(
      StatusCode.OK,
      true,
      'Forum fetched successfully',
      forum as ForumResponse
    );
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

/**
 * Get Forums (Paginated)
 */
export const GetForums = async (limit: number, skip: number) => {
  try {
    const forums = await prisma.forum.findMany({
      where: { isDeleted: false },
      select: forumSummarySelect,
      take: limit,
      skip: skip,
      orderBy: { createdAt: 'desc' },
    });

    return new ApiResponse(
      StatusCode.OK,
      true,
      'Forums fetched successfully',
      forums as ForumSummaryResponse[]
    );
  } catch (error) {
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      [(error as Error).message]
    );
  }
};
