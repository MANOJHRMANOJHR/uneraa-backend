import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Route,
  Tags,
  Security,
  Request,
  Response,
  Body,
  Path,
  Query,
  UploadedFiles,
  FormField
} from 'tsoa';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client'; 
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { 
  userPostSchema, 
  EmojiType, 
  UserPostInput,
  EmojiInput,
  CommentInput
} from './constrollersSchema';
import ApiResponse from '../utils/api-response';
import ApiError from '../utils/api-error';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { StatusCode } from '../constants/statusCode';
import { postQueue } from '../utils/jobs/postQueue';
import { AuthenticatedRequest } from './types/user.type';

@Route('post')
@Tags('Post')
export class PostController extends Controller {
  /**
   * Create a new post
   */
  @Post('create')
  @Security('jwt')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  public async createPost(
    @Request() req: AuthenticatedRequest,
    @FormField() title: string,
    @FormField() content: string,
    @FormField() tags?: string,
    @FormField() category?: string,
    @FormField() markdown?: string,
    @FormField() videoUrl?: string,
    @FormField() imageUrl?: string,
    @FormField() embedUrl?: string,
    @FormField() isPublished?: boolean,
    @FormField() publishedAt?: string,
    @UploadedFiles() files?: {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    }
  ): Promise<ApiResponse<any>> {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    // Parse tags if sent as JSON string
    let parsedTags: string[] = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch (e) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Tags must be a valid JSON array');
    }

    try {
      let imageUrlOnCloudinary: string | undefined;
      let videoUrlOnCloudinary: string | undefined;

      if (files?.image?.[0]?.path) {
        const result = await uploadOnCloudinary(files.image[0].path, 'post Images');
        imageUrlOnCloudinary = typeof result === 'string' ? result : result?.url;
      }

      if (files?.video?.[0]?.path) {
        const result = await uploadOnCloudinary(files.video[0].path, 'post Videos');
        videoUrlOnCloudinary = typeof result === 'string' ? result : result?.url;
      }

      const tagsData =
        parsedTags.length > 0
          ? {
              create: parsedTags.map((tag: string) => ({ name: tag })),
            }
          : undefined;

      const data = {
        title,
        content,
        ...(tagsData && { tags: tagsData }),
        imageUrl: imageUrl || imageUrlOnCloudinary || '',
        markdown: markdown || '',
        author: { connect: { id: currentUserId } },
        videoUrl: videoUrl || videoUrlOnCloudinary || '',
        embedUrl: embedUrl || '',
        published: isPublished || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        ...(category
          ? {
              category: {
                connect: {
                  id: category,
                },
              },
            }
          : {}),
      };

      const post = await prisma.post.create({ data });

      if (!isPublished && publishedAt && new Date(publishedAt) > new Date()) {
        await postQueue.add(
          'publishPost',
          { postId: post.id },
          { delay: new Date(publishedAt).getTime() - Date.now() }
        );
      }

      return new ApiResponse(
        StatusCode.CREATED,
        true,
        'Post created successfully',
        post
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get posts with pagination
   */
  @Get()
  @Response<ApiError>(StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error')
  public async getPosts(
    @Query() skip: number = 0,
    @Query() limit: number = 10
  ): Promise<ApiResponse<any>> {
    try {
      const posts = await prisma.post.findMany({
        include: {
          author: true,
          category: true,
          tags: true,
          comments: {
            include: { author: true },
          },
          likes: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      });

      return new ApiResponse(
        StatusCode.OK,
        true,
        'Posts fetched successfully',
        posts
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Delete a post
   */
  @Delete('{id}')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Post not found')
  public async deletePost(
    @Request() req: AuthenticatedRequest,
    @Path() id: string
  ): Promise<ApiResponse<{}>> {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true }
      });

      if (!post) {
        throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
      }

      if (post.authorId !== req.user?.id) {
        throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
      }

      await prisma.post.delete({ where: { id } });
      return new ApiResponse(
        StatusCode.OK,
        true,
        'Post deleted successfully',
        {}
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Update a post
   */
  @Patch('{id}')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Post not found')
  public async updatePost(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: UserPostInput,
    @UploadedFiles() files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] }
  ): Promise<ApiResponse<any>> {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true }
      });

      if (!post) {
        throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
      }

      if (post.authorId !== req.user?.id) {
        throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
      }

      const validationResult = userPostSchema.safeParse(body);
      if (!validationResult.success) {
        throw new ApiError(
          StatusCode.BAD_REQUEST,
          'Validation failed',
          validationResult.error.errors
        );
      }

      const data = validationResult.data;
      const { title, content, tags, markdown, category } = data;

      let imageUrlOnCloudinary: string | undefined;
      let videoUrlOnCloudinary: string | undefined;

      if (files?.image && files.image.length > 0) {
        const uploadResult = await uploadOnCloudinary(
          files.image[0].path,
          'post Images'
        );
        imageUrlOnCloudinary = typeof uploadResult === 'string' 
          ? uploadResult 
          : uploadResult?.url;
      }

      if (files?.video && files.video.length > 0) {
        const uploadResult = await uploadOnCloudinary(
          files.video[0].path,
          'post Videos'
        );
        videoUrlOnCloudinary = typeof uploadResult === 'string' 
          ? uploadResult 
          : uploadResult?.url;
      }

      const tagsData = 
        tags && tags.length > 0 
          ? {
              create: tags.map((tag: string) => ({ name: tag })),
            }
          : undefined;

      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title,
          content,
          tags: tagsData,
          markdown,
          category: { connect: { id: category } },
          imageUrl: imageUrlOnCloudinary ? imageUrlOnCloudinary : undefined,
          videoUrl: videoUrlOnCloudinary ? videoUrlOnCloudinary : undefined,
        },
      });

      return new ApiResponse(
        StatusCode.OK,
        true,
        'Post updated successfully',
        updatedPost
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get likes for a post
   */
  @Get('{id}/likes')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Post not found')
  public async getPostLikes(
    @Path() id: string
  ): Promise<ApiResponse<any>> {
    try {
      const postExists = await prisma.post.findUnique({ where: { id } });
      if (!postExists) {
        throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
      }

      const likes = await prisma.like.findMany({
        where: { postId: id },
        include: { user: true }
      });

      return new ApiResponse(
        StatusCode.OK,
        true,
        'Likes fetched successfully',
        likes
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Toggle like/reaction on a post
   */
  @Post('{id}/like')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Invalid emoji type')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Post not found')
  public async toggleLike(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: EmojiInput
  ): Promise<ApiResponse<any>> {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    const { emoji } = body;

    if (!Object.values(EmojiType).includes(emoji)) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid emoji type');
    }

    try {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
      }

      const existing = await prisma.like.findFirst({
        where: { postId: id, userId: currentUserId }
      });

      if (existing) {
        if (existing.emoji === emoji) {
          // Remove reaction
          await prisma.like.delete({ where: { id: existing.id } });
          return new ApiResponse(
            StatusCode.OK,
            true,
            'Reaction removed',
            {}
          );
        } else {
          // Update reaction
          const updated = await prisma.like.update({
            where: { id: existing.id },
            data: { emoji }
          });
          return new ApiResponse(
            StatusCode.OK,
            true,
            'Reaction updated',
            updated
          );
        }
      } else {
        // Add new reaction
        const like = await prisma.like.create({
          data: {
            postId: id,
            userId: currentUserId,
            emoji
          }
        });
        return new ApiResponse(
          StatusCode.CREATED,
          true,
          'Reaction added',
          like
        );
      }
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Create a comment on a post
   */
  @Post('{id}/comment')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Post not found')
  public async createComment(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: CommentInput
  ): Promise<ApiResponse<any>> {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    const { content, parentId } = body;

    try {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          postId: id,
          authorId: currentUserId,
          parentId: parentId || null
        },
        include: { author: true }
      });

      return new ApiResponse(
        StatusCode.CREATED,
        true,
        'Comment created',
        comment
      );
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
          throw new ApiError(StatusCode.NOT_FOUND, 'Resource not found');
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