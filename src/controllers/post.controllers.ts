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

import prisma from '../lib/prisma.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EmojiType, EmojiInput, CommentInput } from './constrollersSchema.js';
import ApiResponse from '../utils/api-response.js';
import ApiError from '../utils/api-error.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { StatusCode } from '../constants/statusCode.js';
import { postQueue } from '../utils/jobs/postQueue.js';
import { AuthenticatedRequest } from './types/user.type.js';

@Route('post')
@Tags('Post')
export class PostController extends Controller {
  /**
   * Create a new post
   */
  @Post('create')
  @Security('jwt')
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
    const currentUserId = this.getUserId(req);

    const parsedTags = this.parseTags(tags);

    const imageUrlOnCloudinary = await this.handleFileUpload(files?.image?.[0], 'post Images');
    const videoUrlOnCloudinary = await this.handleFileUpload(files?.video?.[0], 'post Videos');

    const tagsData =
      parsedTags.length > 0
        ? { create: parsedTags.map((tag) => ({ name: tag })) }
        : undefined;

    const data = {
      title,
      content,
      ...(tagsData && { tags: tagsData }),
      imageUrl: imageUrlOnCloudinary || imageUrl || '',
      markdown: markdown || '',
      author: { connect: { id: currentUserId } },
      videoUrl: videoUrlOnCloudinary || videoUrl || '',
      embedUrl: embedUrl || '',
      published: isPublished || false,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      ...(category && {
        category: { connect: { id: category } },
      }),
    };

    try {
      const post = await prisma.post.create({ data });

      if (!isPublished && publishedAt && new Date(publishedAt) > new Date()) {
        await postQueue.add(
          'publishPost',
          { postId: post.id },
          { delay: new Date(publishedAt).getTime() - Date.now() }
        );
      }

      return new ApiResponse(StatusCode.CREATED, true, 'Post created', post);
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  @Get()
  public async getPosts(@Query() skip: number = 0, @Query() limit: number = 10): Promise<ApiResponse<any>> {
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
      return this.handlePrismaError(error);
    }
  }

  @Delete('{id}')
  @Security('jwt')
  public async deletePost(@Request() req: AuthenticatedRequest, @Path() id: string): Promise<ApiResponse<{}>> {
    try {
      const post = await this.getPostOrThrow(id);
      if (post.authorId !== req.user?.id) {
        throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
      }

      await prisma.post.delete({ where: { id } });
      return new ApiResponse(StatusCode.OK, true, 'Post deleted', {});
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  @Patch('{id}')
  @Security('jwt')
  public async updatePost(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @FormField() title?: string,
    @FormField() content?: string,
    @FormField() tags?: string,
    @FormField() category?: string,
    @FormField() markdown?: string,
    @FormField() videoUrl?: string,
    @FormField() imageUrl?: string,
    @FormField() embedUrl?: string,
    @UploadedFiles() files?: {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    }
  ): Promise<ApiResponse<any>> {
    const post = await this.getPostOrThrow(id);
    if (post.authorId !== req.user?.id) {
      throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    }

    const parsedTags = this.parseTags(tags);

    const imageUrlOnCloudinary = await this.handleFileUpload(files?.image?.[0], 'post Images');
    const videoUrlOnCloudinary = await this.handleFileUpload(files?.video?.[0], 'post Videos');

    const data = {
      ...(title && { title }),
      ...(content && { content }),
      ...(parsedTags && {
        tags: { set: [], create: parsedTags.map((name) => ({ name })) },
      }),
      ...(markdown && { markdown }),
      ...(imageUrlOnCloudinary || imageUrl) && { imageUrl: imageUrlOnCloudinary || imageUrl },
      ...(videoUrlOnCloudinary || videoUrl) && { videoUrl: videoUrlOnCloudinary || videoUrl },
      ...(embedUrl && { embedUrl }),
      ...(category && { category: { connect: { id: category } } }),
    };

    try {
      const updated = await prisma.post.update({ where: { id }, data });
      return new ApiResponse(StatusCode.OK, true, 'Post updated', updated);
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  @Get('{id}/likes')
  public async getPostLikes(@Path() id: string): Promise<ApiResponse<any>> {
    try {
      await this.getPostOrThrow(id);

      const likes = await prisma.like.findMany({
        where: { postId: id },
        include: { user: true },
      });

      return new ApiResponse(StatusCode.OK, true, 'Likes fetched', likes);
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  @Post('{id}/like')
  @Security('jwt')
  public async toggleLike(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: EmojiInput
  ): Promise<ApiResponse<any>> {
    const currentUserId = this.getUserId(req);
    const { emoji } = body;

    if (!Object.values(EmojiType).includes(emoji)) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid emoji');
    }

    try {
      await this.getPostOrThrow(id);

      const existing = await prisma.like.findFirst({ where: { postId: id, userId: currentUserId } });

      if (existing) {
        if (existing.emoji === emoji) {
          await prisma.like.delete({ where: { id: existing.id } });
          return new ApiResponse(StatusCode.OK, true, 'Reaction removed', {});
        }

        const updated = await prisma.like.update({ where: { id: existing.id }, data: { emoji } });
        return new ApiResponse(StatusCode.OK, true, 'Reaction updated', updated);
      }

      const like = await prisma.like.create({
        data: { postId: id, userId: currentUserId, emoji },
      });

      return new ApiResponse(StatusCode.CREATED, true, 'Reaction added', like);
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  @Post('{id}/comment')
  @Security('jwt')
  public async createComment(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: CommentInput
  ): Promise<ApiResponse<any>> {
    const currentUserId = this.getUserId(req);
    const { content, parentId } = body;

    try {
      await this.getPostOrThrow(id);

      const comment = await prisma.comment.create({
        data: {
          content,
          postId: id,
          authorId: currentUserId,
          parentId: parentId || null,
        },
        include: { author: true },
      });

      return new ApiResponse(StatusCode.CREATED, true, 'Comment created', comment);
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  // ---------------------
  // 🔒 Utility Functions
  // ---------------------

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user?.id) throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
    return req.user.id;
  }

  private async getPostOrThrow(id: string) {
    const post = await prisma.post.findUnique({ where: { id }, select: { id: true, authorId: true } });
    if (!post) throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
    return post;
  }

  private parseTags(tags?: string): string[] {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Tags must be a valid JSON array');
    }
  }

  private async handleFileUpload(file?: Express.Multer.File, folder = '') {
    if (!file?.path) return undefined;
    const result = await uploadOnCloudinary(file.path, folder);
    return typeof result === 'string' ? result : result?.url;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new ApiError(StatusCode.NOT_FOUND, 'Resource not found');
        case 'P2002':
          throw new ApiError(StatusCode.CONFLICT, 'Database conflict');
        default:
          throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Database error', [error.message]);
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
