import prisma from '../../../lib/prisma.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  EmojiType,
  EmojiInput,
  CommentInput,
  UserPostInput,
} from '../types.js';
import ApiResponse from '../../../utils/api-response.js';
import ApiError from '../../../utils/api-error.js';
import { StatusCode } from '../../../constants/statusCode.js';
// import { postQueue } from '../utils/jobs/postQueue.js';
import { AuthenticatedRequest } from '../types.js';
import {
  getPostOrThrow,
  getUserId,
  handleFileUpload,
  handlePrismaError,
  parseTags,
} from '../../../utils/index.js';

export const CreatePost = async (
  req: AuthenticatedRequest,
  body: UserPostInput,
  files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] }
) => {
  const currentUserId = getUserId(req);

  const parsedTags = parseTags(body.tags);

  const imageUrlOnCloudinary = await handleFileUpload(
    files?.image?.[0],
    'post Images'
  );
  const videoUrlOnCloudinary = await handleFileUpload(
    files?.video?.[0],
    'post Videos'
  );

  const tagsData =
    parsedTags.length > 0
      ? { create: parsedTags.map((tag) => ({ name: tag })) }
      : undefined;

  const data = {
    title: body.title,
    content: body.content,
    ...(tagsData && { tags: tagsData }),
    imageUrl: imageUrlOnCloudinary || body.imageUrl || '',
    author: { connect: { id: currentUserId } },
    videoUrl: videoUrlOnCloudinary || body.videoUrl || '',
    embedUrl: body.embedUrl || '',
    published: body.isPublished || false,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    ...(body.category && {
      category: { connect: { id: body.category } },
    }),
  };

  try {
    const post = await prisma.post.create({ data });

    // if (!isPublished && publishedAt && new Date(publishedAt) > new Date()) {
    //   await postQueue.add(
    //     'publishPost',
    //     { postId: post.id },
    //     { delay: new Date(publishedAt).getTime() - Date.now() }
    //   );
    // }

    return new ApiResponse(StatusCode.CREATED, true, 'Post created', post);
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

export const GetPost = async (skip: number, limit: number) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        category: true,
        tags: true,
        comments: { include: { author: true } },
        likes: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    return new ApiResponse(StatusCode.OK, true, 'Posts fetched', posts);
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const DeletePost = async (req: AuthenticatedRequest, id: string) => {
  try {
    const post = await getPostOrThrow({
      where: { id },
      select: { id: true, authorId: true },
      unique: true,
    });
    if (post.authorId !== req.user?.id) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    await prisma.post.delete({ where: { id } });
    return new ApiResponse(StatusCode.OK, true, 'Post deleted', {});
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const UpdatePost = async (
  req: AuthenticatedRequest,
  body: UserPostInput,
  files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] }
) => {
  const post = await getPostOrThrow({
    where: { id: body.id },
    select: { id: true, authorId: true },
    unique: true,
  });
  if (post.authorId !== req.user?.id) {
    throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
  }

  const parsedTags = parseTags(body.tags);

  const imageUrlOnCloudinary = await handleFileUpload(
    files?.image?.[0],
    'post Images'
  );
  const videoUrlOnCloudinary = await handleFileUpload(
    files?.video?.[0],
    'post Videos'
  );

  const data = {
    ...(body.title && { title: body.title }),
    ...(body.content && { content: body.content }),
    ...(parsedTags && {
      tags: { set: [], create: parsedTags.map((name) => ({ name })) },
    }),
    ...(imageUrlOnCloudinary && {
      imageUrl: imageUrlOnCloudinary,
    }),
    ...(videoUrlOnCloudinary && {
      videoUrl: videoUrlOnCloudinary,
    }),
    ...(body.embedUrl && { embedUrl: body.embedUrl }),
    ...(body.category && { category: { connect: { id: body.category } } }),
  };

  try {
    const updated = await prisma.post.update({ where: { id: body.id }, data });
    return new ApiResponse(StatusCode.OK, true, 'Post updated', updated);
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const PostLikeUnlike = async (
  req: AuthenticatedRequest,
  id: string,
  body: EmojiInput
) => {
  const currentUserId = getUserId(req);
  const { emoji } = body;

  if (!Object.values(EmojiType).includes(emoji)) {
    throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid emoji');
  }

  try {
    await getPostOrThrow({
      where: { id },
      select: { id: true, authorId: true },
      unique: true,
    });

    const existing = await prisma.like.findFirst({
      where: { postId: id, userId: currentUserId },
    });

    if (existing) {
      if (existing.emoji === emoji) {
        await prisma.like.delete({ where: { id: existing.id } });
        return new ApiResponse(StatusCode.OK, true, 'Reaction removed', {});
      }

      const updated = await prisma.like.update({
        where: { id: existing.id },
        data: { emoji },
      });
      return new ApiResponse(StatusCode.OK, true, 'Reaction updated', updated);
    }

    const like = await prisma.like.create({
      data: { postId: id, userId: currentUserId, emoji },
    });

    return new ApiResponse(StatusCode.CREATED, true, 'Reaction added', like);
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const CreateComment = async (
  req: AuthenticatedRequest,
  id: string,
  body: CommentInput
) => {
  const currentUserId = getUserId(req);
  const { content, parentId } = body;

  try {
    await getPostOrThrow({
      where: { id },
      select: { id: true, authorId: true },
      unique: true,
    });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        authorId: currentUserId,
        parentId: parentId || null,
      },
      include: { author: true },
    });

    return new ApiResponse(
      StatusCode.CREATED,
      true,
      'Comment created',
      comment
    );
  } catch (error) {
    return handlePrismaError(error);
  }
};
