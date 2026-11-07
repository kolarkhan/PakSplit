import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GroupService } from '../services/groups/GroupService';

const groupService = new GroupService();

const getParamValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? '');

export const createGroup = async (request: Request, response: Response) => {
  const group = await groupService.createGroup(request.auth!.userId, request.body);
  response.status(StatusCodes.CREATED).json({ success: true, message: 'Group created', data: group });
};

export const listGroups = async (request: Request, response: Response) => {
  const groups = await groupService.listGroups(request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Groups fetched', data: groups });
};

export const getGroup = async (request: Request, response: Response) => {
  const group = await groupService.getGroup(getParamValue(request.params.groupId), request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Group fetched', data: group });
};

export const updateGroup = async (request: Request, response: Response) => {
  const group = await groupService.updateGroup(getParamValue(request.params.groupId), request.auth!.userId, request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Group updated', data: group });
};

export const deleteGroup = async (request: Request, response: Response) => {
  const result = await groupService.deleteGroup(getParamValue(request.params.groupId), request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Group deleted', data: result });
};

export const addMember = async (request: Request, response: Response) => {
  const group = await groupService.addMember(
    getParamValue(request.params.groupId),
    request.auth!.userId,
    request.body.userId,
    request.body.role,
  );
  response.status(StatusCodes.CREATED).json({ success: true, message: 'Member added', data: group });
};

export const updateMemberRole = async (request: Request, response: Response) => {
  const group = await groupService.updateMemberRole(
    getParamValue(request.params.groupId),
    request.auth!.userId,
    getParamValue(request.params.userId),
    request.body.role,
  );
  response.status(StatusCodes.OK).json({ success: true, message: 'Member role updated', data: group });
};

export const updateMemberAvailability = async (request: Request, response: Response) => {
  const group = await groupService.updateMemberAvailability(
    getParamValue(request.params.groupId),
    request.auth!.userId,
    getParamValue(request.params.userId),
    request.body,
  );
  response.status(StatusCodes.OK).json({ success: true, message: 'Member availability updated', data: group });
};

export const removeMember = async (request: Request, response: Response) => {
  const group = await groupService.removeMember(
    getParamValue(request.params.groupId),
    request.auth!.userId,
    getParamValue(request.params.userId),
  );
  response.status(StatusCodes.OK).json({ success: true, message: 'Member removed', data: group });
};

export const approveJoinRequest = async (request: Request, response: Response) => {
  const group = await groupService.approveJoinRequest(
    getParamValue(request.params.groupId),
    request.auth!.userId,
    getParamValue(request.params.userId),
  );
  response.status(StatusCodes.OK).json({ success: true, message: 'Join request approved', data: group });
};

export const declineJoinRequest = async (request: Request, response: Response) => {
  const group = await groupService.declineJoinRequest(
    getParamValue(request.params.groupId),
    request.auth!.userId,
    getParamValue(request.params.userId),
  );
  response.status(StatusCodes.OK).json({ success: true, message: 'Join request declined', data: group });
};

export const groupActivity = async (request: Request, response: Response) => {
  const activity = await groupService.getActivity(getParamValue(request.params.groupId));
  response.status(StatusCodes.OK).json({ success: true, message: 'Activity fetched', data: activity });
};

export const inviteLink = async (request: Request, response: Response) => {
  const invite = await groupService.generateInviteLink(getParamValue(request.params.groupId), request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Invite generated', data: invite });
};

export const joinByInvite = async (request: Request, response: Response) => {
  const group = await groupService.joinByInvite(getParamValue(request.params.inviteCode), request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Join request submitted', data: group });
};
