import {
  Controller,
  Get,
  Route,
  Tags,
  Patch,
  Delete,
  Body,
  Path,
  Query,
  Security,
  Request,
  Post,
  Response,
} from 'tsoa';
import { StatusCode } from '../../constants/statusCode.js';
import ApiError from '../../utils/api-error.js';
import ApiResponse from '../../utils/api-response.js';
import { ForumInput, ForumUpdateInput } from './schema.js';
import {
  ForumResponse,
  ForumSummaryResponse,
  AuthenticatedRequest,
} from './types.js';
import {
  CreateForum,
  UpdateForum,
  DeleteForum,
  GetForumById,
  GetForums,
} from './handler/forum.js';

@Route('forums')
@Tags('Forum')
export class ForumController extends Controller {
  /**
   * Create forum
   */
  @Post()
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  public async createForum(
    @Request() req: AuthenticatedRequest,
    @Body() body: ForumInput
  ): Promise<ApiResponse<ForumResponse>> {
    return await CreateForum(req, body);
  }

  /**
   * Update forum
   */
  @Patch('{forumId}')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Forum not found')
  public async updateForum(
    @Request() req: AuthenticatedRequest,
    @Path() forumId: string,
    @Body() body: ForumUpdateInput
  ): Promise<ApiResponse<ForumResponse>> {
    return await UpdateForum(req, forumId, body);
  }

  /**
   * Delete forum
   */
  @Delete('{forumId}')
  @Security('jwt')
  @Response<ApiError>(StatusCode.UNAUTHORIZED, 'Unauthorized')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Forum not found')
  public async deleteForum(
    @Request() req: AuthenticatedRequest,
    @Path() forumId: string
  ): Promise<ApiResponse<{}>> {
    return await DeleteForum(req, forumId);
  }

  /**
   * Get forum by ID
   */
  @Get('{forumId}')
  @Response<ApiError>(StatusCode.NOT_FOUND, 'Forum not found')
  public async getForumById(
    @Path() forumId: string
  ): Promise<ApiResponse<ForumResponse>> {
    return await GetForumById(forumId);
  }

  /**
   * Get forums with pagination
   */
  @Get()
  public async getForums(
    @Query() limit: number = 10,
    @Query() skip: number = 0
  ): Promise<ApiResponse<ForumSummaryResponse[]>> {
    return await GetForums(limit, skip);
  }
}
