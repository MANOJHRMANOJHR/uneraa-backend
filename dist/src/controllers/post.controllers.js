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
import { Controller, Post, Get, Delete, Patch, Route, Tags, Security, Request, Body, Path, Query, UploadedFiles, FormField } from 'tsoa';
import prisma from '../lib/prisma.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EmojiType } from './constrollersSchema.js';
import ApiResponse from '../utils/api-response.js';
import ApiError from '../utils/api-error.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { StatusCode } from '../constants/statusCode.js';
let PostController = class PostController extends Controller {
    /**
     * Create a new post
     */
    async createPost(req, title, content, tags, category, markdown, videoUrl, imageUrl, embedUrl, isPublished, publishedAt, files) {
        const currentUserId = this.getUserId(req);
        const parsedTags = this.parseTags(tags);
        const imageUrlOnCloudinary = await this.handleFileUpload(files?.image?.[0], 'post Images');
        const videoUrlOnCloudinary = await this.handleFileUpload(files?.video?.[0], 'post Videos');
        const tagsData = parsedTags.length > 0
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
            // if (!isPublished && publishedAt && new Date(publishedAt) > new Date()) {
            //   await postQueue.add(
            //     'publishPost',
            //     { postId: post.id },
            //     { delay: new Date(publishedAt).getTime() - Date.now() }
            //   );
            // }
            return new ApiResponse(StatusCode.CREATED, true, 'Post created', post);
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    async getPosts(skip = 0, limit = 10) {
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
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    async deletePost(req, id) {
        try {
            const post = await this.getPostOrThrow(id);
            if (post.authorId !== req.user?.id) {
                throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
            }
            await prisma.post.delete({ where: { id } });
            return new ApiResponse(StatusCode.OK, true, 'Post deleted', {});
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    async updatePost(req, id, title, content, tags, category, markdown, videoUrl, imageUrl, embedUrl, files) {
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
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    async getPostLikes(id) {
        try {
            await this.getPostOrThrow(id);
            const likes = await prisma.like.findMany({
                where: { postId: id },
                include: { user: true },
            });
            return new ApiResponse(StatusCode.OK, true, 'Likes fetched', likes);
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    async toggleLike(req, id, body) {
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
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    async createComment(req, id, body) {
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
        }
        catch (error) {
            return this.handlePrismaError(error);
        }
    }
    // ---------------------
    // 🔒 Utility Functions
    // ---------------------
    getUserId(req) {
        if (!req.user?.id)
            throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
        return req.user.id;
    }
    async getPostOrThrow(id) {
        const post = await prisma.post.findUnique({ where: { id }, select: { id: true, authorId: true } });
        if (!post)
            throw new ApiError(StatusCode.NOT_FOUND, 'Post not found');
        return post;
    }
    parseTags(tags) {
        if (!tags)
            return [];
        try {
            return JSON.parse(tags);
        }
        catch {
            throw new ApiError(StatusCode.BAD_REQUEST, 'Tags must be a valid JSON array');
        }
    }
    async handleFileUpload(file, folder = '') {
        if (!file?.path)
            return undefined;
        const result = await uploadOnCloudinary(file.path, folder);
        return typeof result === 'string' ? result : result?.url;
    }
    handlePrismaError(error) {
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
        if (error instanceof ApiError)
            throw error;
        throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error', error instanceof Error ? [error.message] : []);
    }
};
__decorate([
    Post('create'),
    Security('jwt'),
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
    __param(0, Query()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPosts", null);
__decorate([
    Delete('{id}'),
    Security('jwt'),
    __param(0, Request()),
    __param(1, Path()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deletePost", null);
__decorate([
    Patch('{id}'),
    Security('jwt'),
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
    __param(0, Path()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostLikes", null);
__decorate([
    Post('{id}/like'),
    Security('jwt'),
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
