import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const registerSchema = loginSchema
  .extend({
    displayName: z.string().min(2, 'Name is too short'),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const resetSchema = z.object({ email: z.string().email('Enter a valid email') });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
