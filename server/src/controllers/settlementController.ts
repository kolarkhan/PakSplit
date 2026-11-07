import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SettlementService } from '../services/settlements/SettlementService';

const settlementService = new SettlementService();

export const createSettlement = async (request: Request, response: Response) => {
  const settlement = await settlementService.create(request.auth!.userId, request.body);
  response.status(StatusCodes.CREATED).json({ success: true, message: 'Settlement created', data: settlement });
};

export const getGroupSettlements = async (request: Request, response: Response) => {
  const settlements = await settlementService.list(request.params.groupId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Settlements fetched', data: settlements });
};

export const getSettlement = async (request: Request, response: Response) => {
  const settlement = await settlementService.get(request.params.settlementId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Settlement fetched', data: settlement });
};

export const confirmSettlement = async (request: Request, response: Response) => {
  const settlement = await settlementService.confirm(request.params.settlementId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Settlement confirmed', data: settlement });
};

export const cancelSettlement = async (request: Request, response: Response) => {
  const settlement = await settlementService.cancel(request.params.settlementId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Settlement cancelled', data: settlement });
};
