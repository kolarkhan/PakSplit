import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  language: 'en' | 'ur';
  currency: 'PKR';
  offlineQueueCount: number;
  themePreference: 'system' | 'light' | 'dark';
}

const initialState: UiState = {
  language: 'en',
  currency: 'PKR',
  offlineQueueCount: 0,
  themePreference: 'system',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'en' | 'ur'>) => {
      state.language = action.payload;
    },
    setOfflineQueueCount: (state, action: PayloadAction<number>) => {
      state.offlineQueueCount = action.payload;
    },
    setThemePreference: (state, action: PayloadAction<'system' | 'light' | 'dark'>) => {
      state.themePreference = action.payload;
    },
  },
});

export const { setLanguage, setOfflineQueueCount, setThemePreference } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
