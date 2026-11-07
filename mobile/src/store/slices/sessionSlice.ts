import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '../../types/models';

interface SessionState {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  isAuthenticated: boolean;
}

const initialState: SessionState = {
  isAuthenticated: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user?: User }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.accessToken);
    },
    clearSession: (state) => {
      state.accessToken = undefined;
      state.refreshToken = undefined;
      state.user = undefined;
      state.isAuthenticated = false;
    },
  },
});

export const { setSession, setCurrentUser, clearSession } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
