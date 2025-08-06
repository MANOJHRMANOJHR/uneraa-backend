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
  Body,
  Path,
  Query,
  UploadedFiles,
  FormField
} from 'tsoa';
import {  EmojiInput, CommentInput } from './constrollersSchema.js';
import ApiResponse from '../utils/api-response.js';

// import { postQueue } from '../utils/jobs/postQueue.js';
import { AuthenticatedRequest } from './types/user.type.js';
import { CreateComment, CreatePost, DeletePost, GetPost, PostLikeUnlike, UpdatePost } from '../services/post/handler/post.js';

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
    @FormField() publishedAt?: Date,
    @UploadedFiles() files?: {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    }
  ): Promise<ApiResponse<any>> {
   
    return await CreatePost(req, title, content, tags, category, markdown, videoUrl, imageUrl, embedUrl, isPublished, publishedAt, files)
  }

  @Get()
  public async getPosts(@Query() skip: number = 0, @Query() limit: number = 10): Promise<ApiResponse<any>> {
    
    return await GetPost(skip, limit)
  }

  @Delete('{id}')
  @Security('jwt')
  public async deletePost(@Request() req: AuthenticatedRequest, @Path() id: string): Promise<ApiResponse<{}>> {
    
    return await DeletePost(req, id)
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
    
    return await UpdatePost(req, id, title, content, tags, category, markdown, videoUrl, imageUrl, embedUrl, files )
  }

  @Post('{id}/like')
  @Security('jwt')
  public async toggleLike(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: EmojiInput
  ): Promise<ApiResponse<any>> {
    
    return await PostLikeUnlike(req, id, body)
  }

  @Post('{id}/comment')
  @Security('jwt')
  public async createComment(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: CommentInput
  ): Promise<ApiResponse<any>> {
    
    return await CreateComment(req, id, body)
  }

}
