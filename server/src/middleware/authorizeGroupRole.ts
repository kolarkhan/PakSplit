import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { GroupRepository } from '../repositories/GroupRepository';
import { AppError } from '../utils/AppError';

const groupRepository = new GroupRepository();

export const authorizeGroupRole =
  (allowedRoles: Array<'admin' | 'member'>) =>
  async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    const groupId = request.params.groupId ?? request.body.groupId;
    const userId = request.auth?.userId;

    if (!groupId || !userId) {
      next(new AppError('Unauthorized', StatusCodes.UNAUTHORIZED));
      return;
    }

    const group = await groupRepository.findById(groupId);
    const members = Array.isArray(group?.members) ? group.members : [];
    const membership = members.find(
      (member: { userId?: unknown; role: 'admin' | 'member'; status?: string }) =>
        getMemberUserId(member) === userId && member.status === 'active',
    );

    if (!membership || !allowedRoles.includes(membership.role)) {
      next(new AppError('Forbidden', StatusCodes.FORBIDDEN));
      return;
    }

    next();
  };

const getMemberUserId = (member: { userId?: unknown }) => {
  if (!member || member.userId === undefined || member.userId === null) {
    return '';
  }

  if (typeof member.userId === 'object' && member.userId !== null && '_id' in member.userId) {
    return String((member.userId as { _id: unknown })._id);
  }

  return String(member.userId);
};
