import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UserService } from '../services/users/UserService';

const userService = new UserService();

export const getMe = async (request: Request, response: Response) => {
  const user = await userService.getMe(request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Profile fetched', data: user });
};

export const updateMe = async (request: Request, response: Response) => {
  const user = await userService.updateMe(request.auth!.userId, request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Profile updated', data: user });
};

export const updateLanguage = async (request: Request, response: Response) => {
  const user = await userService.updateMe(request.auth!.userId, { preferredLanguage: request.body.preferredLanguage });
  response.status(StatusCodes.OK).json({ success: true, message: 'Language updated', data: user });
};

export const updateCurrency = async (request: Request, response: Response) => {
  const user = await userService.updateMe(request.auth!.userId, { preferredCurrency: request.body.preferredCurrency });
  response.status(StatusCodes.OK).json({ success: true, message: 'Currency updated', data: user });
};

export const addPaymentMethod = async (request: Request, response: Response) => {
  const user = await userService.addPaymentMethod(request.auth!.userId, request.body);
  response.status(StatusCodes.CREATED).json({ success: true, message: 'Payment method added', data: user });
};

export const updatePaymentMethod = async (request: Request, response: Response) => {
  const user = await userService.updatePaymentMethod(request.auth!.userId, request.params.id, request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Payment method updated', data: user });
};

export const deletePaymentMethod = async (request: Request, response: Response) => {
  const user = await userService.removePaymentMethod(request.auth!.userId, request.params.id);
  response.status(StatusCodes.OK).json({ success: true, message: 'Payment method removed', data: user });
};
