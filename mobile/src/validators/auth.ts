import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.union([z.string().min(10, 'Enter a valid phone number'), z.literal('')]).optional(),
});
