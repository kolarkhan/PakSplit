import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AuthService } from '../services/auth/AuthService';

const authService = new AuthService();

export const register = async (request: Request, response: Response) => {
  const result = await authService.register(request.body);
  response.status(StatusCodes.CREATED).json({ success: true, message: 'Registered successfully', data: result });
};

export const login = async (request: Request, response: Response) => {
  const result = await authService.login(request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Logged in successfully', data: result });
};

export const refreshToken = async (request: Request, response: Response) => {
  const result = await authService.refresh(request.body.refreshToken);
  response.status(StatusCodes.OK).json({ success: true, message: 'Token refreshed', data: result });
};

export const forgotPassword = async (request: Request, response: Response) => {
  const result = await authService.forgotPassword(request.body.email);
  response.status(StatusCodes.OK).json({ success: true, message: 'Reset flow prepared', data: result });
};

export const resetPassword = async (request: Request, response: Response) => {
  const result = await authService.resetPassword(request.body.token, request.body.password);
  response.status(StatusCodes.OK).json({ success: true, message: 'Password reset successful', data: result });
};

export const me = async (request: Request, response: Response) => {
  const result = await authService.me(request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Current user fetched', data: result });
};
