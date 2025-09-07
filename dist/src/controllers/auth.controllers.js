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
import { Controller, Post, Route, Tags, Request, Security, Response, UploadedFiles, } from 'tsoa';
import ApiResponse from '../utils/api-response.js';
import { StatusCode } from '../constants/statusCode.js';
import { LoginUser, LogoutUser, RegisterUser, } from '../services/user/handler/auth.js';
let AuthController = class AuthController extends Controller {
    secure = process.env.ENVIRONMENT !== 'development';
    /**
     * Register a new user
     */
    async registerUser(req, files) {
        const createdUser = await RegisterUser(req.body, files);
        return new ApiResponse(StatusCode.OK, true, 'User registered successfully', createdUser);
    }
    /**
     * Login a user
     */
    async loginUser(req) {
        const token = await LoginUser(req.body);
        // Set cookie manually since we're using tsoa (outside of typical middleware)
        req.res?.cookie('auth_token', token, {
            httpOnly: true,
            secure: this.secure,
            sameSite: 'strict',
        });
        return new ApiResponse(StatusCode.OK, true, 'Signed in successfully', token);
    }
    /**
     * Logout a user
     */
    async logoutUser(req) {
        await LogoutUser(req);
        req.res?.clearCookie('auth_token', {
            httpOnly: true,
            secure: this.secure,
            sameSite: 'strict',
        });
        return new ApiResponse(StatusCode.OK, true, 'User logged out successfully', {});
    }
};
__decorate([
    Post('/register'),
    Response(StatusCode.CONFLICT, 'User already exists'),
    Response(StatusCode.BAD_REQUEST, 'Validation failed'),
    __param(0, Request()),
    __param(1, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerUser", null);
__decorate([
    Post('/login'),
    Response(StatusCode.BAD_REQUEST, 'Validation failed'),
    Response(StatusCode.NOT_FOUND, 'Invalid credentials'),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginUser", null);
__decorate([
    Post('/logout'),
    Security('jwt'),
    Response(StatusCode.UNAUTHORIZED, 'Unauthorized'),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutUser", null);
AuthController = __decorate([
    Route('auth'),
    Tags('Auth')
], AuthController);
export { AuthController };
