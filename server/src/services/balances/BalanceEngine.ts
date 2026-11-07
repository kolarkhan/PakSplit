type LedgerMap = Map<string, number>;

export interface SimplifiedTransfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export class BalanceEngine {
  buildLedger(
    expenses: Array<{
      paidBy: string;
      splits: Array<{ userId: string; amount: number }>;
    }>,
    settlements: Array<{
      payerUserId: string;
      receiverUserId: string;
      amount: number;
      status: string;
    }>,
  ): LedgerMap {
    const ledger: LedgerMap = new Map();

    const applyEdge = (debtor: string, creditor: string, amount: number) => {
      if (!amount || debtor === creditor) {
        return;
      }

      const forwardKey = `${debtor}:${creditor}`;
      const reverseKey = `${creditor}:${debtor}`;
      const reverseAmount = ledger.get(reverseKey) ?? 0;

      if (reverseAmount >= amount) {
        const nextAmount = reverseAmount - amount;
        if (nextAmount === 0) {
          ledger.delete(reverseKey);
        } else {
          ledger.set(reverseKey, nextAmount);
        }
      } else {
        ledger.delete(reverseKey);
        ledger.set(forwardKey, (ledger.get(forwardKey) ?? 0) + (amount - reverseAmount));
      }
    };

    expenses.forEach((expense) => {
      expense.splits.forEach((split) => {
        if (split.userId !== expense.paidBy) {
          applyEdge(split.userId, expense.paidBy, split.amount);
        }
      });
    });

    settlements
      .filter((settlement) => settlement.status === 'completed')
      .forEach((settlement) => {
        applyEdge(settlement.receiverUserId, settlement.payerUserId, settlement.amount);
      });

    return ledger;
  }

  summarizeForUser(ledger: LedgerMap, userId: string) {
    let youOwe = 0;
    let youAreOwed = 0;

    ledger.forEach((amount, key) => {
      const [debtor, creditor] = key.split(':');
      if (debtor === userId) {
        youOwe += amount;
      }
      if (creditor === userId) {
        youAreOwed += amount;
      }
    });

    return {
      youOwe,
      youAreOwed,
      netBalance: youAreOwed - youOwe,
    };
  }
}
