import { z } from 'zod';

import { objectIdSchema } from './commonValidators';

export const createSettlementSchema = z.object({
  body: z.object({
    groupId: objectIdSchema,
    payerUserId: objectIdSchema,
    receiverUserId: objectIdSchema,
    amount: z.number().int().positive(),
    currency: z.string().default('PKR').optional(),
    method: z.enum(['easypaisa', 'jazzcash', 'raast', 'bank', 'cash']),
    note: z.string().max(400).optional(),
    transactionReference: z.string().max(120).optional(),
    accountTitle: z.string().max(120).optional(),
    phoneNumber: z.string().max(20).optional(),
    bankName: z.string().max(80).optional(),
    attachmentUrl: z.string().url().optional(),
  }),
});
