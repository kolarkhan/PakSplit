import { Router } from 'express';

import {
  addMember,
  approveJoinRequest,
  createGroup,
  declineJoinRequest,
  deleteGroup,
  getGroup,
  groupActivity,
  inviteLink,
  joinByInvite,
  listGroups,
  removeMember,
  updateGroup,
  updateMemberAvailability,
  updateMemberRole,
} from '../controllers/groupController';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  addMemberSchema,
  createGroupSchema,
  updateGroupSchema,
  updateMemberAvailabilitySchema,
  updateMemberRoleSchema,
} from '../validators/groupValidators';

export const groupRouter = Router();

groupRouter.use(authenticate);
groupRouter.post('/', validateRequest(createGroupSchema), asyncHandler(createGroup));
groupRouter.get('/', asyncHandler(listGroups));
groupRouter.get('/:groupId', asyncHandler(getGroup));
groupRouter.put('/:groupId', validateRequest(updateGroupSchema), asyncHandler(updateGroup));
groupRouter.delete('/:groupId', asyncHandler(deleteGroup));
groupRouter.post('/:groupId/members', validateRequest(addMemberSchema), asyncHandler(addMember));
groupRouter.put('/:groupId/members/:userId/role', validateRequest(updateMemberRoleSchema), asyncHandler(updateMemberRole));
groupRouter.put(
  '/:groupId/members/:userId/availability',
  validateRequest(updateMemberAvailabilitySchema),
  asyncHandler(updateMemberAvailability),
);
groupRouter.delete('/:groupId/members/:userId', asyncHandler(removeMember));
groupRouter.put('/:groupId/join-requests/:userId/approve', asyncHandler(approveJoinRequest));
groupRouter.delete('/:groupId/join-requests/:userId', asyncHandler(declineJoinRequest));
groupRouter.get('/:groupId/activity', asyncHandler(groupActivity));
groupRouter.post('/:groupId/invite-link', asyncHandler(inviteLink));
groupRouter.post('/join/:inviteCode', asyncHandler(joinByInvite));
