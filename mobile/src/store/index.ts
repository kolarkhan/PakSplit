import { configureStore } from '@reduxjs/toolkit';

import { api } from './api/baseApi';
import { expensesReducer } from './slices/expensesSlice';
import { groupsReducer } from './slices/groupsSlice';
import { sessionReducer } from './slices/sessionSlice';
import { uiReducer } from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    ui: uiReducer,
    groups: groupsReducer,
    expenses: expensesReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
