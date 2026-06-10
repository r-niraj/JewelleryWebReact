import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import adminAuthReducer from './slices/adminAuthSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    adminAuth: adminAuthReducer,
  },
});
