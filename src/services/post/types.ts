export enum EmojiType {
  LIKE = 'like',
  LAUGH = 'laugh',
  CRY = 'cry',
  ANGRY = 'angry',
}

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

export type UserEditInput = {
  name?: string;
  email?: string;
  bio?: string;
  username?: string;
  portfolioLink?: string;
};

export type UserFollowerInput = {
  followingId: string;
  followerId: string;
};

export type UserPostInput = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category: string;
  tags: string;
  imageUrl: string;
  videoUrl: string;
  published: boolean;
  publishedAt: Date | null;
  authorId: string;
  embedUrl: string;
  isPublished: boolean;
};
export type EmojiInput = {
  emoji: EmojiType;
};
export type CommentInput = {
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
};
