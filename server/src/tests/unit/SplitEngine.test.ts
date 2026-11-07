import { describe, expect, it } from 'vitest';

import { SplitEngine } from '../../services/expenses/SplitEngine';

describe('SplitEngine', () => {
  const engine = new SplitEngine();

  it('splits equal amounts with PKR-safe remainder handling', () => {
    const result = engine.compute({
      totalAmount: 4001,
      splitType: 'equal',
      participants: ['ali', 'ahmed', 'sana'],
    });

    expect(result.map((item) => item.amount)).toEqual([1334, 1334, 1333]);
  });

  it('validates exact totals', () => {
    expect(() =>
      engine.compute({
        totalAmount: 1000,
        splitType: 'exact',
        participants: ['ali', 'ahmed'],
        splitValues: [
          { userId: 'ali', amount: 400 },
          { userId: 'ahmed', amount: 500 },
        ],
      }),
    ).toThrowError('Exact split amounts must equal total amount');
  });

  it('supports share-based distribution', () => {
    const result = engine.compute({
      totalAmount: 5000,
      splitType: 'shares',
      participants: ['ali', 'ahmed', 'sana'],
      splitValues: [
        { userId: 'ali', shares: 2 },
        { userId: 'ahmed', shares: 1 },
        { userId: 'sana', shares: 1 },
      ],
    });

    expect(result.reduce((sum, item) => sum + item.amount, 0)).toBe(5000);
    expect(result[0].amount).toBeGreaterThan(result[1].amount);
  });
});
