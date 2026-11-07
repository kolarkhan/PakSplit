import { describe, expect, it } from 'vitest';

import { createExpenseSchema } from '../../validators/expenseValidators';

describe('validators', () => {
  it('rejects invalid expense payloads', () => {
    const result = createExpenseSchema.safeParse({
      body: {
        groupId: 'bad-id',
        title: '',
        totalAmount: 0,
        paidBy: 'bad-id',
        splitType: 'equal',
        participants: [],
      },
    });

    expect(result.success).toBe(false);
  });
});
