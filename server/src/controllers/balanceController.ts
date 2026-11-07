import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GroupService } from '../services/groups/GroupService';
import { BalanceService } from '../services/balances/BalanceService';

const balanceService = new BalanceService();
const groupService = new GroupService();

const getParamValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? '');

export const overallBalance = async (request: Request, response: Response) => {
  const groups = await groupService.listGroups(request.auth!.userId);
  const data = await balanceService.getOverallBalances(request.auth!.userId, groups);
  response.status(StatusCodes.OK).json({ success: true, message: 'Overall balance fetched', data });
};

export const groupBalance = async (request: Request, response: Response) => {
  const data = await balanceService.getGroupBalances(getParamValue(request.params.groupId), request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Group balance fetched', data });
};

export const simplifiedGroupBalance = async (request: Request, response: Response) => {
  const data = await balanceService.getGroupSimplified(getParamValue(request.params.groupId));
  response.status(StatusCodes.OK).json({ success: true, message: 'Simplified balances fetched', data });
};
