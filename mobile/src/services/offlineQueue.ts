import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = 'pak_split_offline_queue';

export interface OfflineAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export const offlineQueue = {
  async list(): Promise<OfflineAction[]> {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async enqueue(action: OfflineAction) {
    const existing = await this.list();
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([action, ...existing]));
  },
  async clear() {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  },
};
