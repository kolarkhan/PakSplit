import { offlineQueue } from './offlineQueue';

export const syncService = {
  async syncPendingActions() {
    const actions = await offlineQueue.list();
    return {
      synced: actions.length,
      status: 'placeholder',
    };
  },
};
