import { StatusCodes } from 'http-status-codes';

import { NotificationRepository } from '../../repositories/NotificationRepository';
import { AppError } from '../../utils/AppError';

export class NotificationService {
  private readonly notificationRepository = new NotificationRepository();

  async createForUsers(payload: Array<Record<string, unknown>>) {
    return this.notificationRepository.createMany(payload);
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.findForUser(userId);
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.markRead(notificationId, userId);

    if (!notification) {
      throw new AppError('Notification not found', StatusCodes.NOT_FOUND);
    }

    return notification;
  }

  async sendPushPlaceholder(userId: string, title: string, body: string) {
    return {
      queued: true,
      provider: 'fcm-placeholder',
      userId,
      title,
      body,
    };
  }
}
