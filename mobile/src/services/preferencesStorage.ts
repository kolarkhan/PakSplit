import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'pak_split_theme_preference';
const AVATAR_URI_KEY = 'pak_split_avatar_uri';

export const preferencesStorage = {
  getThemePreference: () => AsyncStorage.getItem(THEME_PREFERENCE_KEY),
  setThemePreference: (value: 'system' | 'light' | 'dark') => AsyncStorage.setItem(THEME_PREFERENCE_KEY, value),
  getAvatarUri: () => AsyncStorage.getItem(AVATAR_URI_KEY),
  setAvatarUri: (value: string) => AsyncStorage.setItem(AVATAR_URI_KEY, value),
  clearAvatarUri: () => AsyncStorage.removeItem(AVATAR_URI_KEY),
};
