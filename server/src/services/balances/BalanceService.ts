import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { SettlementRepository } from '../../repositories/SettlementRepository';

import { BalanceEngine } from './BalanceEngine';
import { DebtSimplifier } from './DebtSimplifier';

type GroupLike = any;

type CounterpartySummary = {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  amount: number;
  direction: 'owe' | 'owed';
};

export class BalanceService {
  private readonly expenseRepository = new ExpenseRepository();
  private readonly settlementRepository = new SettlementRepository();
  private readonly balanceEngine = new BalanceEngine();
  private readonly debtSimplifier = new DebtSimplifier();

  async getGroupBalances(groupId: string, userId: string) {
    const expenses = await this.expenseRepository.findByGroup(groupId);
    const settlements = await this.settlementRepository.findByGroup(groupId);
    const ledger = this.balanceEngine.buildLedger(
      expenses.map((expense) => ({
        paidBy: expense.paidBy.toString(),
        splits: expense.splits.map((split) => ({ userId: split.userId.toString(), amount: split.amount })),
      })),
      settlements.map((settlement) => ({
        payerUserId: settlement.payerUserId.toString(),
        receiverUserId: settlement.receiverUserId.toString(),
        amount: settlement.amount,
        status: settlement.status,
      })),
    );

    return {
      summary: userId ? this.balanceEngine.summarizeForUser(ledger, userId) : null,
      ledger: Array.from(ledger.entries()).map(([key, amount]) => {
        const [fromUserId, toUserId] = key.split(':');
        return { fromUserId, toUserId, amount };
      }),
    };
  }

  async getGroupSimplified(groupId: string) {
    const groupBalances = await this.getGroupBalances(groupId, '');
    const netPositions = new Map<string, number>();

    groupBalances.ledger.forEach((entry) => {
      netPositions.set(entry.fromUserId, (netPositions.get(entry.fromUserId) ?? 0) - entry.amount);
      netPositions.set(entry.toUserId, (netPositions.get(entry.toUserId) ?? 0) + entry.amount);
    });

    return this.debtSimplifier.simplify(netPositions);
  }

  async getOverallBalances(userId: string, groups: GroupLike[]) {
    const groupSummaries = await Promise.all(
      groups.map(async (group) => ({
        group,
        balances: await this.getGroupBalances(this.getGroupId(group), userId),
      })),
    );

    const totals = groupSummaries.reduce(
      (accumulator, item) => ({
        youOwe: accumulator.youOwe + (item.balances.summary?.youOwe ?? 0),
        youAreOwed: accumulator.youAreOwed + (item.balances.summary?.youAreOwed ?? 0),
        netBalance: accumulator.netBalance + (item.balances.summary?.netBalance ?? 0),
      }),
      { youOwe: 0, youAreOwed: 0, netBalance: 0 },
    );

    const oweMap = new Map<string, Omit<CounterpartySummary, 'amount' | 'direction'> & { amount: number }>();
    const owedMap = new Map<string, Omit<CounterpartySummary, 'amount' | 'direction'> & { amount: number }>();

    groupSummaries.forEach(({ group, balances }) => {
      const memberLookup = this.createMemberLookup(group);

      balances.ledger.forEach((entry) => {
        if (entry.fromUserId === userId) {
          const current = oweMap.get(entry.toUserId) ?? this.createCounterpartySeed(entry.toUserId, memberLookup);
          current.amount += entry.amount;
          oweMap.set(entry.toUserId, current);
        }

        if (entry.toUserId === userId) {
          const current = owedMap.get(entry.fromUserId) ?? this.createCounterpartySeed(entry.fromUserId, memberLookup);
          current.amount += entry.amount;
          owedMap.set(entry.fromUserId, current);
        }
      });
    });

    const topOwe = this.pickTopCounterparty(oweMap, 'owe');
    const topOwed = this.pickTopCounterparty(owedMap, 'owed');
    const topDuePerson = this.pickDominantCounterparty(topOwe, topOwed);

    return {
      ...totals,
      topDuePerson,
    };
  }

  private getGroupId(group: GroupLike) {
    return typeof group._id === 'string' ? group._id : group._id.toString();
  }

  private createMemberLookup(group: GroupLike) {
    const lookup = new Map<string, { fullName: string; avatarUrl?: string }>();

    (group.members ?? []).forEach((member: any) => {
      const userRef = member.userId;
      if (!userRef) {
        return;
      }

      if (typeof userRef === 'object' && userRef._id) {
        lookup.set(String(userRef._id), {
          fullName: userRef.fullName?.trim() || 'Group member',
          avatarUrl: userRef.avatarUrl,
        });
        return;
      }

      lookup.set(String(userRef), {
        fullName: 'Group member',
      });
    });

    return lookup;
  }

  private createCounterpartySeed(
    userId: string,
    lookup: Map<string, { fullName: string; avatarUrl?: string }>,
  ) {
    const profile = lookup.get(userId);

    return {
      userId,
      fullName: profile?.fullName ?? 'Group member',
      avatarUrl: profile?.avatarUrl,
      amount: 0,
    };
  }

  private pickTopCounterparty(
    source: Map<string, Omit<CounterpartySummary, 'amount' | 'direction'> & { amount: number }>,
    direction: 'owe' | 'owed',
  ): CounterpartySummary | null {
    const values = Array.from(source.values()).sort((a, b) => b.amount - a.amount);
    const top = values[0];

    if (!top || top.amount <= 0) {
      return null;
    }

    return {
      userId: top.userId,
      fullName: top.fullName,
      avatarUrl: top.avatarUrl,
      amount: top.amount,
      direction,
    };
  }

  private pickDominantCounterparty(
    topOwe: CounterpartySummary | null,
    topOwed: CounterpartySummary | null,
  ) {
    if (topOwe && topOwed) {
      return topOwe.amount >= topOwed.amount ? topOwe : topOwed;
    }

    return topOwe ?? topOwed;
  }
}


