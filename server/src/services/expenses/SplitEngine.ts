import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../utils/AppError';
import { roundPKR } from '../../utils/currency';

export interface SplitValueInput {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

export interface ComputedSplit {
  userId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export class SplitEngine {
  compute(params: {
    totalAmount: number;
    splitType: 'equal' | 'exact' | 'percentage' | 'shares';
    participants: string[];
    splitValues?: SplitValueInput[];
  }): ComputedSplit[] {
    const { totalAmount, splitType, participants, splitValues = [] } = params;

    if (participants.length === 0) {
      throw new AppError('At least one participant is required', StatusCodes.BAD_REQUEST);
    }

    switch (splitType) {
      case 'equal':
        return this.computeEqual(totalAmount, participants);
      case 'exact':
        return this.computeExact(totalAmount, participants, splitValues);
      case 'percentage':
        return this.computePercentage(totalAmount, participants, splitValues);
      case 'shares':
        return this.computeShares(totalAmount, participants, splitValues);
      default:
        throw new AppError('Unsupported split type', StatusCodes.BAD_REQUEST);
    }
  }

  private computeEqual(totalAmount: number, participants: string[]): ComputedSplit[] {
    const baseAmount = Math.floor(totalAmount / participants.length);
    let remainder = totalAmount - baseAmount * participants.length;

    return participants.map((userId) => {
      const amount = baseAmount + (remainder > 0 ? 1 : 0);
      remainder = Math.max(remainder - 1, 0);
      return { userId, amount };
    });
  }

  private computeExact(totalAmount: number, participants: string[], splitValues: SplitValueInput[]): ComputedSplit[] {
    const normalized = participants.map((userId) => ({
      userId,
      amount: roundPKR(splitValues.find((entry) => entry.userId === userId)?.amount ?? 0),
    }));

    const totalExact = normalized.reduce((sum, item) => sum + item.amount, 0);
    if (totalExact !== totalAmount) {
      throw new AppError('Exact split amounts must equal total amount', StatusCodes.BAD_REQUEST);
    }

    return normalized;
  }

  private computePercentage(totalAmount: number, participants: string[], splitValues: SplitValueInput[]): ComputedSplit[] {
    const percentages = participants.map((userId) => ({
      userId,
      percentage: splitValues.find((entry) => entry.userId === userId)?.percentage ?? 0,
    }));

    const totalPercentage = percentages.reduce((sum, item) => sum + item.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.001) {
      throw new AppError('Percentages must total 100', StatusCodes.BAD_REQUEST);
    }

    return this.distributeRoundedAmounts(
      totalAmount,
      percentages.map((item) => ({
        userId: item.userId,
        ratio: item.percentage / 100,
        meta: { percentage: item.percentage },
      })),
    );
  }

  private computeShares(totalAmount: number, participants: string[], splitValues: SplitValueInput[]): ComputedSplit[] {
    const shares = participants.map((userId) => ({
      userId,
      shares: splitValues.find((entry) => entry.userId === userId)?.shares ?? 0,
    }));

    const totalShares = shares.reduce((sum, item) => sum + item.shares, 0);
    if (totalShares <= 0) {
      throw new AppError('Shares must be greater than zero', StatusCodes.BAD_REQUEST);
    }

    return this.distributeRoundedAmounts(
      totalAmount,
      shares.map((item) => ({
        userId: item.userId,
        ratio: item.shares / totalShares,
        meta: { shares: item.shares },
      })),
    );
  }

  private distributeRoundedAmounts(
    totalAmount: number,
    ratios: Array<{ userId: string; ratio: number; meta?: Omit<ComputedSplit, 'userId' | 'amount'> }>,
  ): ComputedSplit[] {
    const draft = ratios.map((item) => {
      const raw = totalAmount * item.ratio;
      const roundedDown = Math.floor(raw);
      return {
        userId: item.userId,
        amount: roundedDown,
        fraction: raw - roundedDown,
        ...item.meta,
      };
    });

    let remainder = totalAmount - draft.reduce((sum, item) => sum + item.amount, 0);
    draft
      .sort((left, right) => right.fraction - left.fraction)
      .forEach((item) => {
        if (remainder > 0) {
          item.amount += 1;
          remainder -= 1;
        }
      });

    return draft.map(({ fraction, ...item }) => item);
  }
}
