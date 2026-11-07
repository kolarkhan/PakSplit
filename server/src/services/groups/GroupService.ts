import { StatusCodes } from 'http-status-codes';
import { nanoid } from 'nanoid';

import { GroupRepository } from '../../repositories/GroupRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { AppError } from '../../utils/AppError';

import { NotificationService } from '../notifications/NotificationService';

import { ActivityService } from './ActivityService';

type GroupMemberRecord = {
  userId?: unknown;
  status?: string;
  role?: string;
  joinedAt?: Date;
  availabilityStatus?: 'active' | 'unavailable';
  unavailableFrom?: Date;
  unavailableUntil?: Date;
  availabilityNote?: string;
  excludeFromNewExpenses?: boolean;
};

export class GroupService {
  private readonly groupRepository = new GroupRepository();
  private readonly userRepository = new UserRepository();
  private readonly activityService = new ActivityService();
  private readonly notificationService = new NotificationService();

  async createGroup(
    userId: string,
    payload: { name: string; description?: string; avatarUrl?: string; members?: string[] },
  ) {
    const uniqueMembers = Array.from(new Set([userId, ...(payload.members ?? [])]));
    const group = await this.groupRepository.create({
      name: payload.name,
      description: payload.description,
      avatarUrl: payload.avatarUrl,
      createdBy: userId,
      inviteCode: nanoid(10).toUpperCase(),
      members: uniqueMembers.map((memberId) => ({
        userId: memberId,
        role: memberId === userId ? 'admin' : 'member',
        status: 'active',
        availabilityStatus: 'active',
        excludeFromNewExpenses: true,
      })),
    });

    await this.activityService.log({
      groupId: group._id,
      actorUserId: userId,
      type: 'group_created',
      entityType: 'group',
      entityId: group._id,
      metadata: { name: group.name },
    });

    return group;
  }

  listGroups(userId: string) {
    return this.groupRepository.findForUser(userId);
  }

  async getGroup(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    this.assertMembership(group, userId);
    return group;
  }

  async updateGroup(groupId: string, userId: string, payload: Record<string, unknown>) {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, userId);

    const updatedGroup = await this.groupRepository.update(groupId, payload);
    await this.activityService.log({
      groupId,
      actorUserId: userId,
      type: 'group_updated',
      entityType: 'group',
      entityId: groupId,
      metadata: payload,
    });
    return updatedGroup;
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, userId);
    await this.groupRepository.delete(groupId);
    return { deleted: true };
  }

  async addMember(groupId: string, actorUserId: string, targetUserId: string, role: 'admin' | 'member') {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, actorUserId);

    const existing = this.getMembers(group).some((member) => this.getMemberUserId(member) === targetUserId);
    if (existing) {
      throw new AppError('User is already in this group', StatusCodes.CONFLICT);
    }

    const updatedGroup = await this.groupRepository.update(groupId, {
      $push: {
        members: {
          userId: targetUserId,
          role,
          status: 'active',
          joinedAt: new Date(),
          availabilityStatus: 'active',
          excludeFromNewExpenses: true,
        },
      },
    });

    await this.activityService.log({
      groupId,
      actorUserId,
      type: 'member_added',
      entityType: 'group_member',
      entityId: groupId,
      metadata: { targetUserId, role },
    });

    return updatedGroup;
  }

  async updateMemberRole(groupId: string, actorUserId: string, targetUserId: string, role: 'admin' | 'member') {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, actorUserId);

    const members = this.getMembers(group);
    const targetMember = members.find(
      (member) => this.getMemberUserId(member) === targetUserId && member.status === 'active',
    );

    if (!targetMember) {
      throw new AppError('Member not found', StatusCodes.NOT_FOUND);
    }

    if (targetMember.role === role) {
      throw new AppError('This member already has that role', StatusCodes.CONFLICT);
    }

    const activeAdmins = members.filter((member) => member.status === 'active' && member.role === 'admin');
    if (targetMember.role === 'admin' && role === 'member' && activeAdmins.length <= 1) {
      throw new AppError('This group must keep at least one admin', StatusCodes.BAD_REQUEST);
    }

    const updatedGroup = await this.groupRepository.update(groupId, {
      $set: {
        members: members.map((member) =>
          this.getMemberUserId(member) === targetUserId ? { ...member, role } : member,
        ),
      },
    });

    await this.activityService.log({
      groupId,
      actorUserId,
      type: 'member_role_updated',
      entityType: 'group_member',
      entityId: groupId,
      metadata: { targetUserId, role },
    });

    if (targetUserId !== actorUserId) {
      await this.notificationService.createForUsers([
        {
          userId: targetUserId,
          type: 'member_role_updated',
          title: 'Your group role changed',
          body: `Your role in ${group?.name ?? 'this group'} is now ${role}.`,
          metadata: { groupId, targetUserId, role },
        },
      ]);
    }

    return updatedGroup;
  }

  async updateMemberAvailability(
    groupId: string,
    actorUserId: string,
    targetUserId: string,
    payload: {
      availabilityStatus: 'active' | 'unavailable';
      unavailableUntil?: string;
      availabilityNote?: string;
      excludeFromNewExpenses?: boolean;
    },
  ) {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, actorUserId);

    const members = this.getMembers(group);
    const targetMember = members.find(
      (member) => this.getMemberUserId(member) === targetUserId && member.status === 'active',
    );

    if (!targetMember) {
      throw new AppError('Member not found', StatusCodes.NOT_FOUND);
    }

    const availabilityStatus = payload.availabilityStatus;
    const unavailableUntil = payload.unavailableUntil ? new Date(payload.unavailableUntil) : undefined;
    if (payload.unavailableUntil && (!unavailableUntil || Number.isNaN(unavailableUntil.getTime()))) {
      throw new AppError('A valid unavailable until date is required', StatusCodes.BAD_REQUEST);
    }

    const nextMembers = members.map((member) => {
      if (this.getMemberUserId(member) !== targetUserId) {
        return member;
      }

      if (availabilityStatus === 'active') {
        return {
          ...member,
          availabilityStatus: 'active',
          unavailableFrom: undefined,
          unavailableUntil: undefined,
          availabilityNote: undefined,
          excludeFromNewExpenses: false,
        };
      }

      return {
        ...member,
        availabilityStatus: 'unavailable',
        unavailableFrom: new Date(),
        unavailableUntil,
        availabilityNote: payload.availabilityNote?.trim() || 'Temporarily unavailable',
        excludeFromNewExpenses: payload.excludeFromNewExpenses ?? true,
      };
    });

    const updatedGroup = await this.groupRepository.update(groupId, {
      $set: {
        members: nextMembers,
      },
    });

    const availabilityMetadata = {
      targetUserId,
      availabilityStatus,
      unavailableUntil: unavailableUntil?.toISOString(),
      availabilityNote: payload.availabilityNote,
      excludeFromNewExpenses: payload.excludeFromNewExpenses ?? true,
    };

    await this.activityService.log({
      groupId,
      actorUserId,
      type: 'member_availability_updated',
      entityType: 'group_member',
      entityId: groupId,
      metadata: availabilityMetadata,
    });

    if (targetUserId !== actorUserId) {
      await this.notificationService.createForUsers([
        {
          userId: targetUserId,
          type: 'member_availability_updated',
          title: availabilityStatus === 'unavailable' ? 'Marked unavailable in a group' : 'Marked active in a group',
          body:
            availabilityStatus === 'unavailable'
              ? unavailableUntil
                ? `Your status in ${group?.name ?? 'this group'} was set to unavailable until ${unavailableUntil.toLocaleDateString('en-PK')}.`
                : `Your status in ${group?.name ?? 'this group'} was set to unavailable until further notice.`
              : `Your status in ${group?.name ?? 'this group'} was restored to active.`,
          metadata: { groupId, ...availabilityMetadata },
        },
      ]);
    }

    return updatedGroup;
  }

  async removeMember(groupId: string, actorUserId: string, targetUserId: string) {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, actorUserId);

    const activeAdmins = this.getMembers(group).filter((member) => member.status === 'active' && member.role === 'admin');
    const targetMember = this.getMembers(group).find(
      (member) => this.getMemberUserId(member) === targetUserId && member.status === 'active',
    );

    if (!targetMember) {
      throw new AppError('Member not found', StatusCodes.NOT_FOUND);
    }

    if (targetMember.role === 'admin' && activeAdmins.length <= 1) {
      throw new AppError('Transfer or add another admin before removing the last admin', StatusCodes.BAD_REQUEST);
    }

    const updatedGroup = await this.groupRepository.update(groupId, {
      $set: {
        members: this.getMembers(group).map((member) =>
          this.getMemberUserId(member) === targetUserId ? { ...member, status: 'removed' } : member,
        ),
      },
    });

    await this.activityService.log({
      groupId,
      actorUserId,
      type: 'member_removed',
      entityType: 'group_member',
      entityId: groupId,
      metadata: { targetUserId },
    });

    if (targetUserId !== actorUserId) {
      await this.notificationService.createForUsers([
        {
          userId: targetUserId,
          type: 'member_removed',
          title: 'You were removed from a group',
          body: `Your access to ${group?.name ?? 'this group'} was removed by an admin.`,
          metadata: { groupId, targetUserId },
        },
      ]);
    }

    return updatedGroup;
  }

  async approveJoinRequest(groupId: string, actorUserId: string, targetUserId: string) {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, actorUserId);

    const pendingMember = this.getMembers(group).find(
      (member) => this.getMemberUserId(member) === targetUserId && member.status === 'pending',
    );

    if (!pendingMember) {
      throw new AppError('Join request not found', StatusCodes.NOT_FOUND);
    }

    const updatedGroup = await this.groupRepository.update(groupId, {
      $set: {
        members: this.getMembers(group).map((member) =>
          this.getMemberUserId(member) === targetUserId
            ? {
                ...member,
                status: 'active',
                joinedAt: new Date(),
                role: member.role ?? 'member',
                availabilityStatus: 'active',
                unavailableFrom: undefined,
                unavailableUntil: undefined,
                availabilityNote: undefined,
                excludeFromNewExpenses: true,
              }
            : member,
        ),
      },
    });

    await this.activityService.log({
      groupId,
      actorUserId,
      type: 'member_request_approved',
      entityType: 'group_member',
      entityId: groupId,
      metadata: { targetUserId },
    });

    await this.notificationService.createForUsers([
      {
        userId: targetUserId,
        type: 'member_request_approved',
        title: 'Join request approved',
        body: `Your request to join ${group?.name ?? 'this group'} was approved.`,
        metadata: { groupId, targetUserId },
      },
    ]);

    return updatedGroup;
  }

  async declineJoinRequest(groupId: string, actorUserId: string, targetUserId: string) {
    const group = await this.groupRepository.findById(groupId);
    this.assertAdmin(group, actorUserId);

    const pendingMember = this.getMembers(group).find(
      (member) => this.getMemberUserId(member) === targetUserId && member.status === 'pending',
    );

    if (!pendingMember) {
      throw new AppError('Join request not found', StatusCodes.NOT_FOUND);
    }

    const updatedGroup = await this.groupRepository.update(groupId, {
      $set: {
        members: this.getMembers(group).filter((member) => this.getMemberUserId(member) !== targetUserId),
      },
    });

    await this.activityService.log({
      groupId,
      actorUserId,
      type: 'member_request_declined',
      entityType: 'group_member',
      entityId: groupId,
      metadata: { targetUserId },
    });

    await this.notificationService.createForUsers([
      {
        userId: targetUserId,
        type: 'member_request_declined',
        title: 'Join request declined',
        body: `Your request to join ${group?.name ?? 'this group'} was declined.`,
        metadata: { groupId, targetUserId },
      },
    ]);

    return updatedGroup;
  }

  async generateInviteLink(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    this.assertMembership(group, userId);

    return {
      inviteCode: group?.inviteCode,
      inviteUrl: `paksplit://join/${group?.inviteCode}`,
      qrPlaceholder: `QR:${group?.inviteCode}`,
    };
  }

  async joinByInvite(inviteCode: string, userId: string) {
    const group = await this.groupRepository.findByInviteCode(inviteCode);
    if (!group) {
      throw new AppError('Invite link is invalid', StatusCodes.NOT_FOUND);
    }

    const existing = this.getMembers(group).find((member) => this.getMemberUserId(member) === userId);

    if (existing?.status === 'active') {
      throw new AppError('You are already a member of this group', StatusCodes.CONFLICT);
    }

    if (existing?.status === 'pending') {
      throw new AppError('Your join request is already pending', StatusCodes.CONFLICT);
    }

    const requester = await this.userRepository.findById(userId);
    const requesterName = requester?.fullName ?? 'A user';

    const nextMembers = existing
      ? this.getMembers(group).map((member) =>
          this.getMemberUserId(member) === userId
            ? { ...member, status: 'pending', role: 'member' }
            : member,
        )
      : [
          ...this.getMembers(group),
          {
            userId,
            role: 'member',
            status: 'pending',
            joinedAt: new Date(),
            availabilityStatus: 'active',
            excludeFromNewExpenses: true,
          },
        ];

    const updatedGroup = await this.groupRepository.update(group._id.toString(), {
      $set: {
        members: nextMembers,
      },
    });

    const adminIds = this.getMembers(group)
      .filter((member) => member.status === 'active' && member.role === 'admin')
      .map((member) => this.getMemberUserId(member))
      .filter(Boolean);

    if (adminIds.length > 0) {
      await this.notificationService.createForUsers(
        adminIds.map((adminId) => ({
          userId: adminId,
          type: 'member_request',
          title: 'New join request',
          body: `${requesterName} wants to join ${group.name}.`,
          metadata: { groupId: group._id, requesterUserId: userId, requesterName },
        })),
      );
    }

    await this.activityService.log({
      groupId: group._id,
      actorUserId: userId,
      type: 'member_request_submitted',
      entityType: 'group_member',
      entityId: group._id,
      metadata: { requesterUserId: userId },
    });

    return updatedGroup;
  }

  getActivity(groupId: string) {
    return this.activityService.getGroupActivity(groupId);
  }

  private assertMembership(group: any, userId: string) {
    if (!group) {
      throw new AppError('Group not found', StatusCodes.NOT_FOUND);
    }

    const members = this.getMembers(group);
    if (members.length === 0) {
      throw new AppError('This group has no active member records', StatusCodes.FORBIDDEN);
    }

    const isMember = members.some((member) => this.getMemberUserId(member) === userId && member.status === 'active');
    if (!isMember) {
      throw new AppError('You are not a member of this group', StatusCodes.FORBIDDEN);
    }
  }

  private assertAdmin(group: any, userId: string) {
    this.assertMembership(group, userId);

    const isAdmin = this.getMembers(group).some(
      (member) => this.getMemberUserId(member) === userId && member.status === 'active' && member.role === 'admin',
    );

    if (!isAdmin) {
      throw new AppError('Admin role required', StatusCodes.FORBIDDEN);
    }
  }

  private getMembers(group: any): GroupMemberRecord[] {
    return Array.isArray(group?.members) ? group.members : [];
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
}
