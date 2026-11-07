import { StatusCodes } from 'http-status-codes';

import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { GroupRepository } from '../../repositories/GroupRepository';
import { AppError } from '../../utils/AppError';

import { ActivityService } from '../groups/ActivityService';
import { NotificationService } from '../notifications/NotificationService';

import { SplitEngine, type SplitValueInput } from './SplitEngine';

type GroupMemberRecord = {
  userId?: unknown;
  status?: string;
  role?: string;
  joinedAt?: Date | string;
};

export class ExpenseService {
  private readonly expenseRepository = new ExpenseRepository();
  private readonly groupRepository = new GroupRepository();
  private readonly splitEngine = new SplitEngine();
  private readonly activityService = new ActivityService();
  private readonly notificationService = new NotificationService();

  async createExpense(
    userId: string,
    payload: {
      groupId: string;
      title: string;
      description?: string;
      category?: string;
      totalAmount: number;
      currency?: string;
      paidBy: string;
      splitType: 'equal' | 'exact' | 'percentage' | 'shares';
      participants: string[];
      splitValues?: SplitValueInput[];
      notes?: string;
      receiptUrl?: string;
      expenseDate?: string;
    },
  ) {
    const { group } = await this.assertGroupMember(payload.groupId, userId);
    const splits = this.splitEngine.compute({
      totalAmount: payload.totalAmount,
      splitType: payload.splitType,
      participants: payload.participants,
      splitValues: payload.splitValues,
    });

    const expense = await this.expenseRepository.create({
      ...payload,
      expenseDate: payload.expenseDate ? new Date(payload.expenseDate) : new Date(),
      splits,
      createdBy: userId,
      updatedBy: userId,
    });

    await this.activityService.log({
      groupId: payload.groupId,
      actorUserId: userId,
      type: 'expense_added',
      entityType: 'expense',
      entityId: expense._id,
      metadata: { title: expense.title, totalAmount: expense.totalAmount },
    });

    const activeMembers = this.getActiveMembers(group);
    const actorName = this.getActorName(activeMembers, userId);
    const groupName = group?.name ?? 'your group';
    const notificationPayload = activeMembers.map((member) => ({
      userId: this.getMemberUserId(member),
      type: 'expense_added',
      title: this.getMemberUserId(member) === userId ? `Expense added in ${groupName}` : `New expense in ${groupName}`,
      body:
        this.getMemberUserId(member) === userId
          ? `You added ${expense.title} in ${groupName} for PKR ${expense.totalAmount.toLocaleString('en-PK')}.`
          : `${actorName} added ${expense.title} in ${groupName} for PKR ${expense.totalAmount.toLocaleString('en-PK')}.`,
      metadata: {
        groupId: payload.groupId,
        groupName,
        expenseId: expense._id,
        title: expense.title,
        totalAmount: expense.totalAmount,
        actorName,
      },
    }));

    if (notificationPayload.length > 0) {
      await this.notificationService.createForUsers(notificationPayload);
    }

    return expense;
  }

  async getGroupExpenses(groupId: string, userId: string) {
    const { joinedAt } = await this.assertGroupMember(groupId, userId);
    return this.expenseRepository.findByGroupSince(groupId, joinedAt);
  }

  async getRecentExpensesForUser(userId: string) {
    const groups = await this.groupRepository.findForUser(userId);
    const memberships = groups
      .map((group) => {
        const member = this.getActiveMembers(group).find((item) => this.getMemberUserId(item) === userId);
        if (!member) {
          return null;
        }

        return {
          groupId: group._id.toString(),
          joinedAt: this.getMemberJoinedAt(member),
        };
      })
      .filter((membership): membership is { groupId: string; joinedAt: Date } => Boolean(membership));

    if (memberships.length === 0) {
      return [];
    }

    const membershipMap = new Map(memberships.map((membership) => [membership.groupId, membership.joinedAt]));
    const recentExpenses = await this.expenseRepository.findRecentByGroupIdsExpanded(
      memberships.map((membership) => membership.groupId),
      50,
    );

    return recentExpenses
      .filter((expense) => {
        const groupRef = expense.groupId;
        const expenseGroupId = typeof groupRef === 'object' && groupRef !== null && '_id' in groupRef
          ? String((groupRef as { _id: unknown })._id)
          : String(groupRef);
        const joinedAt = membershipMap.get(expenseGroupId);

        if (!joinedAt) {
          return false;
        }

        return new Date(expense.expenseDate) >= joinedAt;
      })
      .slice(0, 6);
  }

  async getExpense(expenseId: string, userId?: string) {
    const expense = await this.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new AppError('Expense not found', StatusCodes.NOT_FOUND);
    }

    if (userId) {
      const { joinedAt } = await this.assertGroupMember(expense.groupId.toString(), userId);
      if (new Date(expense.expenseDate) < joinedAt) {
        throw new AppError('Expense access denied', StatusCodes.FORBIDDEN);
      }
    }

    return expense;
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    payload: Partial<{
      title: string;
      description?: string;
      category?: string;
      totalAmount: number;
      currency?: string;
      paidBy: string;
      splitType: 'equal' | 'exact' | 'percentage' | 'shares';
      participants: string[];
      splitValues?: SplitValueInput[];
      notes?: string;
      receiptUrl?: string;
      expenseDate?: string;
    }>,
  ) {
    const existing = await this.getExpense(expenseId, userId);

    const nextPayload: Record<string, unknown> = {
      ...payload,
      updatedBy: userId,
    };

    if (payload.totalAmount && payload.splitType && payload.participants) {
      nextPayload.splits = this.splitEngine.compute({
        totalAmount: payload.totalAmount,
        splitType: payload.splitType,
        participants: payload.participants,
        splitValues: payload.splitValues,
      });
    }

    const expense = await this.expenseRepository.update(expenseId, nextPayload);
    await this.activityService.log({
      groupId: existing.groupId,
      actorUserId: userId,
      type: 'expense_updated',
      entityType: 'expense',
      entityId: expenseId,
      metadata: payload,
    });
    return expense;
  }

  async deleteExpense(expenseId: string, userId: string) {
    await this.getExpense(expenseId, userId);
    await this.expenseRepository.delete(expenseId);
    return { deleted: true };
  }

  async attachReceipt(expenseId: string, receiptUrl: string, userId: string) {
    await this.getExpense(expenseId, userId);
    return this.expenseRepository.update(expenseId, { receiptUrl, updatedBy: userId });
  }

  private async assertGroupMember(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    const members = this.getActiveMembers(group);
    const currentMember = members.find((member) => this.getMemberUserId(member) === userId && member.status === 'active');

    if (!currentMember) {
      throw new AppError('Group access denied', StatusCodes.FORBIDDEN);
    }

    return {
      group,
      member: currentMember,
      joinedAt: this.getMemberJoinedAt(currentMember),
    };
  }

  private getActiveMembers(group: any): GroupMemberRecord[] {
    return Array.isArray(group?.members) ? group.members.filter((member: { status?: string }) => member.status === 'active') : [];
  }

  private getActorName(members: GroupMemberRecord[], userId: string) {
    const actor = members.find((member) => this.getMemberUserId(member) === userId);
    if (actor && typeof actor.userId === 'object' && actor.userId !== null && 'fullName' in actor.userId) {
      return String((actor.userId as { fullName: unknown }).fullName);
    }

    return 'A group member';
  }

  private getMemberUserId(member: GroupMemberRecord) {
    if (!member || member.userId === undefined || member.userId === null) {
      return '';
    }

    if (typeof member.userId === 'object' && member.userId !== null && '_id' in member.userId) {
      return String((member.userId as { _id: unknown })._id);
    }

    return String(member.userId);
  }

  private getMemberJoinedAt(member: GroupMemberRecord) {
    if (member?.joinedAt) {
      return new Date(member.joinedAt);
    }

    return new Date(0);
  }
}
