import { ActivityLogRepository } from '../../repositories/ActivityLogRepository';

export class ActivityService {
  private readonly activityRepository = new ActivityLogRepository();

  log(payload: Record<string, unknown>) {
    return this.activityRepository.create(payload);
  }

  getGroupActivity(groupId: string) {
    return this.activityRepository.findByGroup(groupId);
  }
}
