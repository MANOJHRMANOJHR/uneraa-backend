import {
  Route,
  Tags,
  Post,
  Body,
  Response,
} from 'tsoa';
import prisma from '../lib/prisma.js';
import ApiResponse from '../utils/api-response.js';
import ApiError from '../utils/api-error.js';
import { StatusCode } from '../constants/statusCode.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { userJoinWaitListSchema } from './constrollersSchema.js';

@Route('join-waitlist')
@Tags('JoinWaitList')
export class JoinWaitListController {
  /**
   * Submit the join waitlist form
   * @param body - Contains name and email
   */
  @Post('submit')
  @Response<ApiError>(StatusCode.BAD_REQUEST, 'Validation failed')
  @Response<ApiError>(StatusCode.CONFLICT, 'Email already exists')
  @Response<ApiError>(StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error')
  public async submitWaitListForm(
    @Body() body: { name: string; email: string }
  ): Promise<ApiResponse<string>> {
    const validation = userJoinWaitListSchema.safeParse(body);
    if (!validation.success) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        'Validation failed',
        validation.error.errors
      );
    }

    const { name, email } = validation.data;
    try {
      // Check for duplicate entry
      const existing = await prisma.joinWaitlist.findUnique({
        where: { email },
      });

      if (existing) {
        return new ApiResponse(StatusCode.CONFLICT,false, 'Email already exists', '');
      }

      await prisma.joinWaitlist.create({
        data: { name, email },
      });

      return new ApiResponse(
        StatusCode.OK,
        true,
        'Thank you for joining the waitlist!',
        ''
      );
    } catch (error) {
      return this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): ApiResponse<string> {
  if (error instanceof PrismaClientKnownRequestError) {
    return new ApiResponse(
      StatusCode.INTERNAL_SERVER_ERROR,
      false,
      'Database error',
      error.message
    );
  }

  if (error instanceof ApiError) throw error;

  return new ApiResponse(
    StatusCode.INTERNAL_SERVER_ERROR,
    false,
    'Internal server error',
    error instanceof Error ? error.message : ''
  );
}
}
