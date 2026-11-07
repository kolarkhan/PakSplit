import { z } from 'zod';

import { objectIdSchema } from './commonValidators';

const splitEntrySchema = z.object({
  userId: objectIdSchema,
  amount: z.number().int().nonnegative().optional(),
  percentage: z.number().nonnegative().optional(),
  shares: z.number().nonnegative().optional(),
});

export const createExpenseSchema = z.object({
  body: z.object({
    groupId: objectIdSchema,
    title: z.string().min(2).max(160),
    description: z.string().max(400).optional(),
    category: z
      .enum([
        'food',
        'travel',
        'fuel',
        'grocery',
        'rent',
        'utility_bills',
        'shopping',
        'event',
        'other',
      ])
      .default('other'),
    totalAmount: z.number().int().positive(),
    currency: z.string().default('PKR').optional(),
    paidBy: objectIdSchema,
    splitType: z.enum(['equal', 'exact', 'percentage', 'shares']),
    participants: z.array(objectIdSchema).min(1),
    splitValues: z.array(splitEntrySchema).optional(),
    notes: z.string().max(500).optional(),
    receiptUrl: z.string().url().optional(),
    expenseDate: z.string().datetime().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: createExpenseSchema.shape.body.partial(),
  params: z.object({
    expenseId: objectIdSchema,
  }),
});
