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
import { Controller, Get, Route, Tags, Patch, Delete, Body, Path, Query, Security, Request, Post, Response, } from 'tsoa';
import prisma from '../lib/prisma.js';
import { userEditSchema, userFollowerSchema } from './constrollersSchema.js';
import { StatusCode } from '../constants/statusCode.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { userProfileSelect, userSummarySelect } from './types/user.type.js';
let UserController = class UserController extends Controller {
    /**
     * Update user profile
     */
    async updateUserProfile(req, body) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
        }
        const validationResult = userEditSchema.safeParse(body);
        if (!validationResult.success) {
            throw new ApiError(StatusCode.BAD_REQUEST, 'Validation failed', validationResult.error.errors);
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
            return new ApiResponse(StatusCode.OK, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: userProfileSelect,
            });
            if (!user) {
                throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
            }
            return new ApiResponse(StatusCode.OK, true, 'User fetched successfully', user);
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Delete user
     */
    async deleteUser(req, userId) {
        if (req.user?.id !== userId) {
            throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
        }
        try {
            await prisma.user.delete({ where: { id: userId } });
            return new ApiResponse(StatusCode.NO_CONTENT, true, 'User deleted successfully', {});
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    /**
     * Get users with pagination
     */
    async getUsers(limit = 10, skip = 0) {
        try {
            const users = await prisma.user.findMany({
                where: { isObsolete: false },
                select: userSummarySelect,
                take: limit,
                skip: skip,
            });
            return new ApiResponse(StatusCode.OK, true, 'Users fetched successfully', users);
        }
        catch (error) {
            throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error', error instanceof Error ? [error.message] : []);
        }
    }
    /**
     * Follow or unfollow a user
     */
    async followUser(req, body) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new ApiError(StatusCode.UNAUTHORIZED, 'Unauthorized');
        }
        const validationResult = userFollowerSchema.safeParse(body);
        if (!validationResult.success) {
            throw new ApiError(StatusCode.BAD_REQUEST, 'Validation failed', validationResult.error.errors);
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
            let isFollowing;
            let message;
            if (existingFollow) {
                await prisma.follow.delete({
                    where: {
                        followerId_followingId: { followerId, followingId },
                    },
                });
                isFollowing = false;
                message = 'Unfollowed user successfully';
            }
            else {
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
                    throw new ApiError(StatusCode.NOT_FOUND, 'User not found');
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
    Patch('update'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    Response(StatusCode.BAD_REQUEST, 'Validation failed'),
    Response(StatusCode.CONFLICT, 'Email or username already exists'),
    Response(StatusCode.NOT_FOUND, 'User not found'),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUserProfile", null);
__decorate([
    Get('{userId}'),
    Response(StatusCode.NOT_FOUND, 'User not found'),
    __param(0, Path()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    Delete('{userId}'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    Response(StatusCode.NOT_FOUND, 'User not found'),
    __param(0, Request()),
    __param(1, Path()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    Post('follow'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    Response(StatusCode.BAD_REQUEST, 'Validation failed'),
    Response(StatusCode.NOT_FOUND, 'User not found'),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "followUser", null);
UserController = __decorate([
    Route('user'),
    Tags('User')
], UserController);
export { UserController };
