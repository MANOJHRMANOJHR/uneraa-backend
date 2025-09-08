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
import { Controller, Post, Get, Delete, Patch, Route, Tags, Security, Request, Body, Path, Query, UploadedFiles, } from 'tsoa';
import { CreateComment, CreatePost, DeletePost, GetPost, PostLikeUnlike, UpdatePost, } from '../services/post/handler/post.js';
let PostController = class PostController extends Controller {
    /**
     * Create a new post
     */
    async createPost(req, body, files) {
        return await CreatePost(req, body, files);
    }
    async getPosts(skip = 0, limit = 10) {
        return await GetPost(skip, limit);
    }
    async deletePost(req, id) {
        return await DeletePost(req, id);
    }
    async updatePost(req, body, files) {
        return await UpdatePost(req, body, files);
    }
    async toggleLike(req, id, body) {
        return await PostLikeUnlike(req, id, body);
    }
    async createComment(req, id, body) {
        return await CreateComment(req, id, body);
    }
};
__decorate([
    Post('create'),
    Security('jwt'),
    __param(0, Request()),
    __param(1, Body()),
    __param(2, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
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
    __param(1, Body()),
    __param(2, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePost", null);
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
