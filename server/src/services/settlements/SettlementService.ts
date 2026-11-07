import { StatusCodes } from 'http-status-codes';

import { GroupRepository } from '../../repositories/GroupRepository';
import { SettlementRepository } from '../../repositories/SettlementRepository';
import { AppError } from '../../utils/AppError';

import { ActivityService } from '../groups/ActivityService';
import { NotificationService } from '../notifications/NotificationService';

export class SettlementService {
  private readonly groupRepository = new GroupRepository();
  private readonly settlementRepository = new SettlementRepository();
  private readonly activityService = new ActivityService();
  private readonly notificationService = new NotificationService();

  async create(userId: string, payload: Record<string, unknown> & { groupId: string; receiverUserId: string }) {
    await this.assertMember(payload.groupId, userId);
    const settlement = await this.settlementRepository.create({
      ...payload,
      initiatedBy: userId,
      status: payload.method === 'cash' ? 'completed' : 'pending',
    });

    await this.activityService.log({
      groupId: payload.groupId,
      actorUserId: userId,
      type: 'settlement_recorded',
      entityType: 'settlement',
      entityId: settlement._id,
      metadata: { amount: payload.amount, method: payload.method },
    });

    await this.notificationService.createForUsers([
      {
        userId: payload.receiverUserId,
        type: 'settlement_requested',
        title: 'Settlement request',
        body: 'A new settlement request has been recorded in your group.',
        metadata: { settlementId: settlement._id },
      },
    ]);

    return settlement;
  }

  async list(groupId: string, userId: string) {
    await this.assertMember(groupId, userId);
    return this.settlementRepository.findByGroup(groupId);
  }

  async get(settlementId: string, userId: string) {
    const settlement = await this.settlementRepository.findById(settlementId);
    if (!settlement) {
      throw new AppError('Settlement not found', StatusCodes.NOT_FOUND);
    }
    await this.assertMember(settlement.groupId.toString(), userId);
    return settlement;
  }

  async confirm(settlementId: string, userId: string) {
    const settlement = await this.get(settlementId, userId);
    if (settlement.receiverUserId.toString() !== userId) {
      throw new AppError('Only the receiver can confirm this settlement', StatusCodes.FORBIDDEN);
    }

    return this.settlementRepository.update(settlementId, {
      status: 'completed',
      confirmedBy: userId,
    });
  }

  async cancel(settlementId: string, userId: string) {
    const settlement = await this.get(settlementId, userId);
    if (![settlement.initiatedBy.toString(), settlement.receiverUserId.toString()].includes(userId)) {
      throw new AppError('You cannot cancel this settlement', StatusCodes.FORBIDDEN);
    }

    return this.settlementRepository.update(settlementId, {
      status: 'cancelled',
    });
  }

  private async assertMember(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    const members = Array.isArray(group?.members) ? group.members : [];
    const isMember = members.some((member: { userId?: unknown; status?: string }) =>
      this.getMemberUserId(member) === userId && member.status === 'active',
    );

    if (!isMember) {
      throw new AppError('Group access denied', StatusCodes.FORBIDDEN);
    }
  }

  private getMemberUserId(member: { userId?: unknown }) {
    if (!member || member.userId === undefined || member.userId === null) {
      return '';
    }

    if (typeof member.userId === 'object' && member.userId !== null && '_id' in member.userId) {
      return String((member.userId as { _id: unknown })._id);
    }

    return String(member.userId);
  }
}
