var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Post, Get, Delete, Patch, Route, Tags, Security, Request, Response, Body, Path, Query, UploadedFiles, FormField } from 'tsoa';
import prisma from '../lib/prisma.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EmojiType } from './constrollersSchema.js';
import ApiResponse from '../utils/api-response.js';
import ApiError from '../utils/api-error.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { StatusCode } from '../constants/statusCode.js';
import { postQueue } from '../utils/jobs/postQueue.js';
let PostController = class PostController extends Controller {
    /**
     * Create a new post
     */
    async createPost(req, title, content, tags, category, markdown, videoUrl, imageUrl, embedUrl, isPublished, publishedAt, files) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
        }
        // Parse tags if sent as JSON string
        let parsedTags = [];
        try {
            parsedTags = tags ? JSON.parse(tags) : [];
        }
        catch (e) {
            throw new ApiError(StatusCode.BAD_REQUEST, 'Tags must be a valid JSON array');
        }
        try {
            let imageUrlOnCloudinary;
            let videoUrlOnCloudinary;
            if (files?.image?.[0]?.path) {
                const result = await uploadOnCloudinary(files.image[0].path, 'post Images');
                imageUrlOnCloudinary = typeof result === 'string' ? result : result?.url;
            }
            if (files?.video?.[0]?.path) {
                const result = await uploadOnCloudinary(files.video[0].path, 'post Videos');
                videoUrlOnCloudinary = typeof result === 'string' ? result : result?.url;
            }
            const tagsData = parsedTags.length > 0
                ? {
                    create: parsedTags.map((tag) => ({ name: tag })),
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
                await postQueue.add('publishPost', { postId: post.id }, { delay: new Date(publishedAt).getTime() - Date.now() });
            }
            return new ApiResponse(StatusCode.CREATED, true, 'Post created successfully', post);
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Get posts with pagination
     */
    async getPosts(skip = 0, limit = 10) {
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
            return new ApiResponse(StatusCode.OK, true, 'Posts fetched successfully', posts);
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Delete a post
     */
    async deletePost(req, id) {
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
            return new ApiResponse(StatusCode.OK, true, 'Post deleted successfully', {});
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Update a post
     */
    async updatePost(req, id, title, content, tags, category, markdown, videoUrl, imageUrl, embedUrl, files) {
        // 1) Fetch & authorize
        const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
        if (!existing)
            throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
        if (existing.authorId !== req.user?.id)
            throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
        // 2) Parse tags array from JSON string, if provided
        let parsedTags;
        if (tags) {
            try {
                parsedTags = JSON.parse(tags);
            }
            catch {
                throw new ApiError(StatusCode.BAD_REQUEST, 'Tags must be valid JSON array');
            }
        }
        // 3) Handle new file uploads
        let imageUrlOnCloudinary;
        let videoUrlOnCloudinary;
        if (files?.image?.[0]?.path) {
            const r = await uploadOnCloudinary(files.image[0].path, 'post Images');
            imageUrlOnCloudinary = typeof r === 'string' ? r : r?.url;
        }
        if (files?.video?.[0]?.path) {
            const r = await uploadOnCloudinary(files.video[0].path, 'post Videos');
            videoUrlOnCloudinary = typeof r === 'string' ? r : r?.url;
        }
        // 4) Build Prisma update data with conditional spreads
        const data = {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(parsedTags && { tags: { set: [], create: parsedTags.map(name => ({ name })) } }),
            ...(markdown !== undefined && { markdown }),
            ...(videoUrl || videoUrlOnCloudinary) && { videoUrl: videoUrl || videoUrlOnCloudinary },
            ...(imageUrl || imageUrlOnCloudinary) && { imageUrl: imageUrl || imageUrlOnCloudinary },
            ...(embedUrl !== undefined && { embedUrl }),
            ...(category && { category: { connect: { id: category } } }),
        };
        // 5) Execute update
        const updated = await prisma.post.update({ where: { id }, data });
        return new ApiResponse(StatusCode.OK, true, 'Post updated successfully', updated);
    }
    /**
     * Get likes for a post
     */
    async getPostLikes(id) {
        try {
            const postExists = await prisma.post.findUnique({ where: { id } });
            if (!postExists) {
                throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
            }
            const likes = await prisma.like.findMany({
                where: { postId: id },
                include: { user: true }
            });
            return new ApiResponse(StatusCode.OK, true, 'Likes fetched successfully', likes);
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Toggle like/reaction on a post
     */
    async toggleLike(req, id, body) {
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
                    return new ApiResponse(StatusCode.OK, true, 'Reaction removed', {});
                }
                else {
                    // Update reaction
                    const updated = await prisma.like.update({
                        where: { id: existing.id },
                        data: { emoji }
                    });
                    return new ApiResponse(StatusCode.OK, true, 'Reaction updated', updated);
                }
            }
            else {
                // Add new reaction
                const like = await prisma.like.create({
                    data: {
                        postId: id,
                        userId: currentUserId,
                        emoji
                    }
                });
                return new ApiResponse(StatusCode.CREATED, true, 'Reaction added', like);
            }
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Create a comment on a post
     */
    async createComment(req, id, body) {
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
            return new ApiResponse(StatusCode.CREATED, true, 'Comment created', comment);
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Centralized Prisma error handler
     */
    handlePrismaError(error) {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2025':
                    throw new ApiError(StatusCode.NOT_FOUND, 'Resource not found');
                case 'P2002':
                    throw new ApiError(StatusCode.CONFLICT, 'Database conflict error');
                default:
                    throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Database error', [error.message]);
            }
        }
        if (error instanceof ApiError)
            throw error;
        throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error', error instanceof Error ? [error.message] : []);
    }
};
__decorate([
    Post('create'),
    Security('jwt'),
    Response(StatusCode.BAD_REQUEST, 'Validation failed'),
    __param(0, Request()),
    __param(1, FormField()),
    __param(2, FormField()),
    __param(3, FormField()),
    __param(4, FormField()),
    __param(5, FormField()),
    __param(6, FormField()),
    __param(7, FormField()),
    __param(8, FormField()),
    __param(9, FormField()),
    __param(10, FormField()),
    __param(11, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, Boolean, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    Get(),
    Response(StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error'),
    __param(0, Query()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPosts", null);
__decorate([
    Delete('{id}'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    Response(StatusCode.NOT_FOUND, 'Post not found'),
    __param(0, Request()),
    __param(1, Path()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deletePost", null);
__decorate([
    Patch('{id}'),
    Security('jwt'),
    Response(StatusCode.BAD_REQUEST, 'Validation failed'),
    __param(0, Request()),
    __param(1, Path()),
    __param(2, FormField()),
    __param(3, FormField()),
    __param(4, FormField()),
    __param(5, FormField()),
    __param(6, FormField()),
    __param(7, FormField()),
    __param(8, FormField()),
    __param(9, FormField()),
    __param(10, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePost", null);
__decorate([
    Get('{id}/likes'),
    Response(StatusCode.NOT_FOUND, 'Post not found'),
    __param(0, Path()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostLikes", null);
__decorate([
    Post('{id}/like'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    Response(StatusCode.BAD_REQUEST, 'Invalid emoji type'),
    Response(StatusCode.NOT_FOUND, 'Post not found'),
    __param(0, Request()),
    __param(1, Path()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "toggleLike", null);
__decorate([
    Post('{id}/comment'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    Response(StatusCode.NOT_FOUND, 'Post not found'),
    __param(0, Request()),
    __param(1, Path()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createComment", null);
PostController = __decorate([
    Route('post'),
    Tags('Post')
], PostController);
export { PostController };
