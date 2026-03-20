import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import logReducer from './slices/logSlice';
import insightReducer from './slices/insightSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    log: logReducer,
    insight: insightReducer,
  },
});
