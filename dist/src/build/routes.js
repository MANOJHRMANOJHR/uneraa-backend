import { fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../controllers/user.controller.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PostController } from './../controllers/post.controllers.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { JoinWaitListController } from './../controllers/joinWaitList.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/auth.controllers.js';
import { expressAuthentication } from './../middleware/auth.middleware.js';
import multer from 'multer';
const expressAuthenticationRecasted = expressAuthentication;
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "UserProfileResponse": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "techStack": { "dataType": "array", "array": { "dataType": "string" }, "required": true }, "coverImgUrl": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "profileImgUrl": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "portfolioLink": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "bio": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "email": { "dataType": "string", "required": true }, "username": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "name": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "id": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UserProfileResponse_": {
        "dataType": "refObject",
        "properties": {
            "statusCode": { "dataType": "double", "required": true },
            "status": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "union", "subSchemas": [{ "ref": "UserProfileResponse" }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiError": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string", "required": true },
            "message": { "dataType": "string", "required": true },
            "stack": { "dataType": "string" },
            "statusCode": { "dataType": "double", "required": true },
            "errors": { "dataType": "array", "array": { "dataType": "any" }, "default": [] },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserEditInput": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "portfolioLink": { "dataType": "string" }, "username": { "dataType": "string" }, "bio": { "dataType": "string" }, "email": { "dataType": "string" }, "name": { "dataType": "string" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse____": {
        "dataType": "refObject",
        "properties": {
            "statusCode": { "dataType": "double", "required": true },
            "status": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "union", "subSchemas": [{ "dataType": "nestedObjectLiteral", "nestedProperties": {} }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserSummaryResponse": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "techStack": { "dataType": "array", "array": { "dataType": "string" }, "required": true }, "bio": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "coverImgUrl": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "profileImgUrl": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "email": { "dataType": "string", "required": true }, "name": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "username": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "id": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UserSummaryResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "statusCode": { "dataType": "double", "required": true },
            "status": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "union", "subSchemas": [{ "dataType": "array", "array": { "dataType": "refAlias", "ref": "UserSummaryResponse" } }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FollowResponse": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "isFollowing": { "dataType": "boolean", "required": true }, "message": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_FollowResponse_": {
        "dataType": "refObject",
        "properties": {
            "statusCode": { "dataType": "double", "required": true },
            "status": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "union", "subSchemas": [{ "ref": "FollowResponse" }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserFollowerInput": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "followerId": { "dataType": "string", "required": true }, "followingId": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_any_": {
        "dataType": "refObject",
        "properties": {
            "statusCode": { "dataType": "double", "required": true },
            "status": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "union", "subSchemas": [{ "dataType": "any" }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmojiType": {
        "dataType": "refEnum",
        "enums": ["like", "laugh", "cry", "angry"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmojiInput": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "emoji": { "ref": "EmojiType", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentInput": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "parentId": { "dataType": "string" }, "authorId": { "dataType": "string", "required": true }, "postId": { "dataType": "string", "required": true }, "content": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_string_": {
        "dataType": "refObject",
        "properties": {
            "statusCode": { "dataType": "double", "required": true },
            "status": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
export function RegisterRoutes(app, opts) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const upload = opts?.multer || multer({ "limits": { "fileSize": 8388608 } });
    const argsUserController_updateUserProfile = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        body: { "in": "body", "name": "body", "required": true, "ref": "UserEditInput" },
    };
    app.patch('/api/v1/user/update', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(UserController)), ...(fetchMiddlewares(UserController.prototype.updateUserProfile)), async function UserController_updateUserProfile(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUserProfile, request, response });
            const controller = new UserController();
            await templateService.apiHandler({
                methodName: 'updateUserProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_getUserById = {
        userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/user/:userId', ...(fetchMiddlewares(UserController)), ...(fetchMiddlewares(UserController.prototype.getUserById)), async function UserController_getUserById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUserById, request, response });
            const controller = new UserController();
            await templateService.apiHandler({
                methodName: 'getUserById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_deleteUser = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
    };
    app.delete('/api/v1/user/:userId', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(UserController)), ...(fetchMiddlewares(UserController.prototype.deleteUser)), async function UserController_deleteUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_deleteUser, request, response });
            const controller = new UserController();
            await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_getUsers = {
        limit: { "default": 10, "in": "query", "name": "limit", "dataType": "double" },
        skip: { "default": 0, "in": "query", "name": "skip", "dataType": "double" },
    };
    app.get('/api/v1/user', ...(fetchMiddlewares(UserController)), ...(fetchMiddlewares(UserController.prototype.getUsers)), async function UserController_getUsers(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUsers, request, response });
            const controller = new UserController();
            await templateService.apiHandler({
                methodName: 'getUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_followUser = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        body: { "in": "body", "name": "body", "required": true, "ref": "UserFollowerInput" },
    };
    app.post('/api/v1/user/follow', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(UserController)), ...(fetchMiddlewares(UserController.prototype.followUser)), async function UserController_followUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_followUser, request, response });
            const controller = new UserController();
            await templateService.apiHandler({
                methodName: 'followUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_createPost = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        title: { "in": "formData", "name": "title", "required": true, "dataType": "string" },
        content: { "in": "formData", "name": "content", "required": true, "dataType": "string" },
        tags: { "in": "formData", "name": "tags", "dataType": "string" },
        category: { "in": "formData", "name": "category", "dataType": "string" },
        markdown: { "in": "formData", "name": "markdown", "dataType": "string" },
        videoUrl: { "in": "formData", "name": "videoUrl", "dataType": "string" },
        imageUrl: { "in": "formData", "name": "imageUrl", "dataType": "string" },
        embedUrl: { "in": "formData", "name": "embedUrl", "dataType": "string" },
        isPublished: { "in": "formData", "name": "isPublished", "dataType": "string" },
        publishedAt: { "in": "formData", "name": "publishedAt", "dataType": "string" },
        files: { "in": "formData", "name": "files", "dataType": "array", "array": { "dataType": "file" } },
    };
    app.post('/api/v1/post/create', authenticateMiddleware([{ "jwt": [] }]), upload.fields([
        {
            name: "files",
        }
    ]), ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.createPost)), async function PostController_createPost(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_createPost, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'createPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_getPosts = {
        skip: { "default": 0, "in": "query", "name": "skip", "dataType": "double" },
        limit: { "default": 10, "in": "query", "name": "limit", "dataType": "double" },
    };
    app.get('/api/v1/post', ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.getPosts)), async function PostController_getPosts(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_getPosts, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'getPosts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_deletePost = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/api/v1/post/:id', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.deletePost)), async function PostController_deletePost(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_deletePost, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'deletePost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_updatePost = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        title: { "in": "formData", "name": "title", "dataType": "string" },
        content: { "in": "formData", "name": "content", "dataType": "string" },
        tags: { "in": "formData", "name": "tags", "dataType": "string" },
        category: { "in": "formData", "name": "category", "dataType": "string" },
        markdown: { "in": "formData", "name": "markdown", "dataType": "string" },
        videoUrl: { "in": "formData", "name": "videoUrl", "dataType": "string" },
        imageUrl: { "in": "formData", "name": "imageUrl", "dataType": "string" },
        embedUrl: { "in": "formData", "name": "embedUrl", "dataType": "string" },
        files: { "in": "formData", "name": "files", "dataType": "array", "array": { "dataType": "file" } },
    };
    app.patch('/api/v1/post/:id', authenticateMiddleware([{ "jwt": [] }]), upload.fields([
        {
            name: "files",
        }
    ]), ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.updatePost)), async function PostController_updatePost(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_updatePost, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'updatePost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_getPostLikes = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/post/:id/likes', ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.getPostLikes)), async function PostController_getPostLikes(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_getPostLikes, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'getPostLikes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_toggleLike = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        body: { "in": "body", "name": "body", "required": true, "ref": "EmojiInput" },
    };
    app.post('/api/v1/post/:id/like', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.toggleLike)), async function PostController_toggleLike(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_toggleLike, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'toggleLike',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPostController_createComment = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        body: { "in": "body", "name": "body", "required": true, "ref": "CommentInput" },
    };
    app.post('/api/v1/post/:id/comment', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(PostController)), ...(fetchMiddlewares(PostController.prototype.createComment)), async function PostController_createComment(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPostController_createComment, request, response });
            const controller = new PostController();
            await templateService.apiHandler({
                methodName: 'createComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsJoinWaitListController_submitWaitListForm = {
        body: { "in": "body", "name": "body", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "email": { "dataType": "string", "required": true }, "name": { "dataType": "string", "required": true } } },
    };
    app.post('/api/v1/join-waitlist/submit', ...(fetchMiddlewares(JoinWaitListController)), ...(fetchMiddlewares(JoinWaitListController.prototype.submitWaitListForm)), async function JoinWaitListController_submitWaitListForm(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsJoinWaitListController_submitWaitListForm, request, response });
            const controller = new JoinWaitListController();
            await templateService.apiHandler({
                methodName: 'submitWaitListForm',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_registerUser = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        files: { "in": "formData", "name": "files", "dataType": "array", "array": { "dataType": "file" } },
    };
    app.post('/api/v1/auth/register', upload.fields([
        {
            name: "files",
        }
    ]), ...(fetchMiddlewares(AuthController)), ...(fetchMiddlewares(AuthController.prototype.registerUser)), async function AuthController_registerUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_registerUser, request, response });
            const controller = new AuthController();
            await templateService.apiHandler({
                methodName: 'registerUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_loginUser = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/auth/login', ...(fetchMiddlewares(AuthController)), ...(fetchMiddlewares(AuthController.prototype.loginUser)), async function AuthController_loginUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_loginUser, request, response });
            const controller = new AuthController();
            await templateService.apiHandler({
                methodName: 'loginUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_logoutUser = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/auth/logout', authenticateMiddleware([{ "jwt": [] }]), ...(fetchMiddlewares(AuthController)), ...(fetchMiddlewares(AuthController.prototype.logoutUser)), async function AuthController_logoutUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logoutUser, request, response });
            const controller = new AuthController();
            await templateService.apiHandler({
                methodName: 'logoutUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    function authenticateMiddleware(security = []) {
        return async function runAuthenticationMiddleware(request, response, next) {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts = [];
            const pushAndRethrow = (error) => {
                failedAttempts.push(error);
                throw error;
            };
            const secMethodOrPromises = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises = [];
                    for (const name in secMethod) {
                        secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                }
                else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                }
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            try {
                request['user'] = await Promise.any(secMethodOrPromises);
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch (err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        };
    }
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
