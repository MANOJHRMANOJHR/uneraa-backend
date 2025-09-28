export const forumSelect = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
};

export const forumSummarySelect = {
  id: true,
  title: true,
  createdAt: true,
};

export type ForumResponse = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
};

export type ForumSummaryResponse = {
  id: string;
  title: string;
  createdAt: Date;
};

export interface AuthenticatedRequest extends Express.Request {
  user?: { id: string; email: string };
}
