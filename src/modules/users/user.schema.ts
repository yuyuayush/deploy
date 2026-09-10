import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address format'),
  role: z.enum(['admin', 'user']).default('user').optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format (UUID expected)'),
});
