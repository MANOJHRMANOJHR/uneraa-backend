import { AuthenticatedRequest } from '../controllers/types/user.type.js';
import ApiError from './api-error.js';
import { StatusCode } from '../constants/statusCode.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { uploadOnCloudinary } from './cloudinary.js';
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export function getUserId(req: AuthenticatedRequest): string {
  if (!req.user?.id) {
    throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
  }
  return req.user.id;
}

type GetPostOptions<T extends Prisma.PostSelect> = {
  where: Prisma.PostWhereInput; // filter (id, slug, published, etc.)
  select: T;
  unique?: boolean; // if unique query (id/slug),  true
};

export async function getPostOrThrow<
T extends Prisma.PostSelect
>({ where, select, unique = false }: GetPostOptions<T>): Promise<
Prisma.PostGetPayload<{ select: T }>
> {
  const post = unique
    ? await prisma.post.findUnique({ where: where as Prisma.PostWhereUniqueInput, select })
    : await prisma.post.findFirst({ where, select });

  if (!post) throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
  return post;
}

export function parseTags(tags?: string): string[] {
  if (!tags) return [];
  try {
    return JSON.parse(tags);
  } catch {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      'Tags must be a valid JSON array'
    );
  }
}

export async function handleFileUpload(
  file?: Express.Multer.File,
  folder = ''
) {
  if (!file?.path) return undefined;
  const result = await uploadOnCloudinary(file.path, folder);
  return typeof result === 'string' ? result : result?.url;
}

export function handlePrismaError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        throw new ApiError(StatusCode.NOT_FOUND, 'Resource not found');
      case 'P2002':
        throw new ApiError(StatusCode.CONFLICT, 'Database conflict');
      default:
        throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Database error', [
          error.message,
        ]);
    }
  }

  if (error instanceof ApiError) throw error;

  throw new ApiError(
    StatusCode.INTERNAL_SERVER_ERROR,
    'Internal server error',
    error instanceof Error ? [error.message] : []
  );
}
