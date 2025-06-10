import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import ApiResponse from '../utils/api-response';
import ApiError from '../utils/api-error';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { StatusCode } from '../constants/statusCode';
import { userPostSchema } from './constrollersSchema';

const createPost = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = userPostSchema.safeParse(req.body);

    if (success) {
      const {
        title,
        content,
        tags,
        imageUrl,
        markdown,
        category,
        authorId,
        videoUrl,
        embedUrl,
        isPublished,
        publishedAt,
      } = data;

      let imageLocalPath, videoLocalPath;
      let imageUrlOnCloudinary, videoUrlOnCloudinary;

      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.image.length > 0
      ) {
        imageLocalPath = req.files.image[0].path;
      }
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.video.length > 0
      ) {
        videoLocalPath = req.files.video[0].path;
      }

      if (imageLocalPath) {
        const uploadResult = await uploadOnCloudinary(
          imageLocalPath,
          'post Images'
        );
        imageUrlOnCloudinary = typeof uploadResult === 'string' ? uploadResult : uploadResult?.url;
      }
      if (videoLocalPath) {
        const uploadResult = await uploadOnCloudinary(
          videoLocalPath,
          'post Videos'
        );
        videoUrlOnCloudinary = typeof uploadResult === 'string' ? uploadResult : uploadResult?.url;
      }

      const post = await prisma.post.create({
        data: {
          title,
          content,
          tags: tags && tags.length > 0 ? { create: tags.map((tag: string) => ({ name: tag })) } : undefined,
          imageUrl: imageUrl || imageUrlOnCloudinary || '',
          markdown: markdown || '',
          category: { connect: { id: category } },
          author: { connect: { id: authorId } },
          videoUrl: videoUrl || videoUrlOnCloudinary || '',
          embedUrl: embedUrl || '',
          published: isPublished || false,
          publishedAt: publishedAt || null,
        },
      });

      res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, true, "post creted successfully", post));
    } else {
      res.status(StatusCode.BAD_REQUEST).json(new ApiError(StatusCode.BAD_REQUEST," failed to create post", error.errors));
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
}

const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {  
        author: true,
        category: true,
        tags: true,
        comments: {
          include: {
            author: true,
          },
        },
        likes: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 posts
      skip: parseInt(req.query.skip as string) || 0, 
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, true, "Posts fetched successfully", posts));
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
}

const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(StatusCode.NOT_FOUND).json(new ApiError(StatusCode.NOT_FOUND, 'Post not found'));
      return; 
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, true, 'Post deleted successfully', {}));
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
}
const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { success, data, error } = userPostSchema.safeParse(req.body);

    if (success) {
      const {
        title,
        content,
        tags,
        imageUrl,
        markdown,
        category,
        authorId,
        videoUrl,
        embedUrl,
        isPublished,
        publishedAt,
      } = data;

      let imageLocalPath, videoLocalPath;
      let imageUrlOnCloudinary, videoUrlOnCloudinary;

      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.image.length > 0
      ) {
        imageLocalPath = req.files.image[0].path;
      }
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files) &&
        req.files.video.length > 0
      ) {
        videoLocalPath = req.files.video[0].path;
      }

      if (imageLocalPath) {
        const uploadResult = await uploadOnCloudinary(
          imageLocalPath,
          'post Images'
        );
        imageUrlOnCloudinary = typeof uploadResult === 'string' ? uploadResult : uploadResult?.url;
      }
      if (videoLocalPath) {
        const uploadResult = await uploadOnCloudinary(
          videoLocalPath,
          'post Videos'
        );
        videoUrlOnCloudinary = typeof uploadResult === 'string' ? uploadResult : uploadResult?.url;
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          title,
          content,
          tags: tags && tags.length > 0 ? { create: tags.map((tag: string) => ({ name: tag })) } : undefined,
          markdown: markdown || '',
          category: { connect: { id: category } },
        },
      }); 
      res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, true, "Post updated successfully", updatedPost));
    } else {
      res.status(StatusCode.BAD_REQUEST).json(new ApiError(StatusCode.BAD_REQUEST, "Failed to update post", error.errors));
    } 
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
}
export default {
  createPost,
  getPosts,
  deletePost,
  updatePost,
};
