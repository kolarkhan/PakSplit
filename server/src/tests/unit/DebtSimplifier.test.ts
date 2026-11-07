import { describe, expect, it } from 'vitest';

import { DebtSimplifier } from '../../services/balances/DebtSimplifier';

describe('DebtSimplifier', () => {
  it('collapses chained obligations', () => {
    const simplifier = new DebtSimplifier();
    const transfers = simplifier.simplify(
      new Map([
        ['A', -500],
        ['B', 0],
        ['C', 500],
      ]),
    );

    expect(transfers).toEqual([{ fromUserId: 'A', toUserId: 'C', amount: 500 }]);
  });
});
