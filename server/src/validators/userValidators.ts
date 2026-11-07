import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z.string().min(10).max(20).optional(),
    avatarUrl: z.string().url().optional(),
    preferredCurrency: z.string().default('PKR').optional(),
    preferredLanguage: z.enum(['en', 'ur']).optional(),
  }),
});

export const paymentMethodSchema = z.object({
  body: z.object({
    type: z.enum(['easypaisa', 'jazzcash', 'raast', 'bank', 'cash']),
    label: z.string().min(2).max(50),
    accountTitle: z.string().max(120).optional(),
    phoneNumber: z.string().max(20).optional(),
    bankName: z.string().max(80).optional(),
    accountNumberMasked: z.string().max(34).optional(),
    ibanMasked: z.string().max(34).optional(),
    isDefault: z.boolean().optional(),
  }),
});
