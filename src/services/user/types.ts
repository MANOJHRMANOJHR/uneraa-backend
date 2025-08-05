import { userEditSchema, userFollowerSchema } from './schema.js';
import { z } from 'zod';

export type UserEditInput = z.infer<typeof userEditSchema>;
export type UserFollowerInput = z.infer<typeof userFollowerSchema>;

export const userProfileSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  profileImgUrl: true,
  coverImgUrl: true,
  bio: true,
  portfolioLink: true,
  techStack: true,
};

export const userSummarySelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  profileImgUrl: true,
  coverImgUrl: true,
  bio: true,
  techStack: true,
};

import { Request as ExpressRequest } from 'express';

export interface AuthenticatedRequest extends ExpressRequest {
  user?: { email: string; id: string };
}

export type UserProfileResponse = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  bio: string | null;
  portfolioLink: string | null;
  profileImgUrl: string | null;
  coverImgUrl: string | null;
  techStack: string[];
};

export type UserSummaryResponse = {
  id: string;
  username: string | null;
  name: string | null;
  email: string;
  profileImgUrl: string | null;
  coverImgUrl: string | null;
  bio: string | null;
  techStack: string[];
};

export type FollowResponse = {
  message: string;
  isFollowing: boolean;
};