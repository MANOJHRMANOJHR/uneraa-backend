import { z } from 'zod';

export const forumSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
});

export const forumUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
});

export interface ForumInput {
  title: string;
  description: string;
}

export interface ForumUpdateInput {
  title?: string;
  description?: string;
}
