import type { SimplifiedTransfer } from './BalanceEngine';

export class DebtSimplifier {
  simplify(netPositions: Map<string, number>): SimplifiedTransfer[] {
    const debtors = Array.from(netPositions.entries())
      .filter(([, balance]) => balance < 0)
      .map(([userId, balance]) => ({ userId, amount: Math.abs(balance) }))
      .sort((left, right) => right.amount - left.amount);

    const creditors = Array.from(netPositions.entries())
      .filter(([, balance]) => balance > 0)
      .map(([userId, balance]) => ({ userId, amount: balance }))
      .sort((left, right) => right.amount - left.amount);

    const transfers: SimplifiedTransfer[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amount = Math.min(debtor.amount, creditor.amount);

      transfers.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount,
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) {
        debtorIndex += 1;
      }
      if (creditor.amount === 0) {
        creditorIndex += 1;
      }
    }

    return transfers;
  }
}
