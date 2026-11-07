import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { NotificationService } from '../services/notifications/NotificationService';
import { AppError } from '../utils/AppError';

const notificationService = new NotificationService();

const getAuthenticatedUserId = (request: Request) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
  }

  return userId;
};

const getParamValue = (value: string | string[] | undefined, fieldName: string) => {
  if (!value) {
    throw new AppError(`${fieldName} is required`, StatusCodes.BAD_REQUEST);
  }

  return Array.isArray(value) ? value[0] : value;
};

export const getNotifications = async (request: Request, response: Response) => {
  const userId = getAuthenticatedUserId(request);
  const notifications = await notificationService.getUserNotifications(userId);

  response.status(StatusCodes.OK).json({
    success: true,
    message: 'Notifications fetched',
    data: notifications,
  });
};

export const markNotificationRead = async (request: Request, response: Response) => {
  const userId = getAuthenticatedUserId(request);
  const notificationId = getParamValue(request.params.id, 'Notification id');
  const notification = await notificationService.markRead(notificationId, userId);

  response.status(StatusCodes.OK).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
};
