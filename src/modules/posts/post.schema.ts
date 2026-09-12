import { z } from 'zod';

export const createPostSchema = z.object({
  authorName: z.string().min(1, 'Author name is required'),
  authorRole: z.string().optional().default('user'),
  authorEmail: z.string().email('Invalid email address'),
  content: z.string().min(1, 'Post content cannot be empty'),
});

export const postIdParamSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
});
