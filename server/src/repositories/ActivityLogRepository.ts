import { ActivityLogModel } from '../models/ActivityLog';

export class ActivityLogRepository {
  create(payload: Record<string, unknown>) {
    return ActivityLogModel.create(payload);
  }

  findByGroup(groupId: string) {
    return ActivityLogModel.find({ groupId }).sort({ createdAt: -1 }).lean();
  }
}
