import { z } from 'zod';

import { objectIdSchema } from './commonValidators';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(280).optional(),
    avatarUrl: z.string().url().optional(),
    members: z.array(objectIdSchema).optional(),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(280).optional(),
    avatarUrl: z.string().url().optional(),
  }),
  params: z.object({
    groupId: objectIdSchema,
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: objectIdSchema,
    role: z.enum(['admin', 'member']).default('member'),
  }),
  params: z.object({
    groupId: objectIdSchema,
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'member']),
  }),
  params: z.object({
    groupId: objectIdSchema,
    userId: objectIdSchema,
  }),
});

export const updateMemberAvailabilitySchema = z.object({
  body: z.object({
    availabilityStatus: z.enum(['active', 'unavailable']),
    unavailableUntil: z.string().datetime().optional(),
    availabilityNote: z.string().max(180).optional(),
    excludeFromNewExpenses: z.boolean().optional(),
  }),
  params: z.object({
    groupId: objectIdSchema,
    userId: objectIdSchema,
  }),
});
