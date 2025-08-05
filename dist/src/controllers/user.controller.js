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
import { StatusCode } from '../constants/statusCode.js';
import { DeleteUser, FollowUser, GetUser, GetUsers, UpdateUserProfile } from '../services/user/handler/user.js';
let UserController = class UserController extends Controller {
    /**
     * Update user profile
     */
    async updateUserProfile(req, body) {
        return await UpdateUserProfile(req, body);
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        return await GetUser(userId);
    }
    /**
     * Delete user
     */
    async deleteUser(req, userId) {
        return await DeleteUser(req, userId);
    }
    /**
     * Get users with pagination
     */
    async getUsers(limit = 10, skip = 0) {
        return await GetUsers(limit, skip);
    }
    /**
     * Follow or unfollow a user
     */
    async followUser(req, body) {
        return await FollowUser(req, body);
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
