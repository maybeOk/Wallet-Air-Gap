import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slices/transactionSlice';
import walletReducer from './slices/walletSlice';
import securityReducer from './slices/securitySlice';

export const store = configureStore({
  reducer: {
    transaction: transactionReducer,
    wallet: walletReducer,
    security: securityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;