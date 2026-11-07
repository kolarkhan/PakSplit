import { Types } from 'mongoose';

import { NotificationModel } from '../models/Notification';

export class NotificationRepository {
  createMany(payload: Array<Record<string, unknown>>) {
    return NotificationModel.insertMany(payload);
  }

  async findForUser(userId: string) {
    const objectId = this.toObjectId(userId);
    if (!objectId) {
      return [];
    }

    return NotificationModel.find({ userId: objectId }).sort({ createdAt: -1 }).lean().exec();
  }

  async markRead(notificationId: string, userId: string) {
    const notificationObjectId = this.toObjectId(notificationId);
    const userObjectId = this.toObjectId(userId);

    if (!notificationObjectId || !userObjectId) {
      return null;
    }

    return NotificationModel.findOneAndUpdate(
      { _id: notificationObjectId, userId: userObjectId },
      { $set: { isRead: true } },
      { new: true },
    )
      .lean()
      .exec();
  }

  private toObjectId(value: string) {
    return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
  }
}
