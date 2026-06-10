import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'shopsastamart_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) =>
      typeof i.productId === 'number' && typeof i.slug === 'string' && typeof i.name === 'string'
    );
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const initialState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const newItem = action.payload;
      const existing = state.items.find((i) => i.slug === newItem.slug);
      if (existing) {
        existing.quantity = Math.min(existing.maxQuantity, existing.quantity + (newItem.quantity || 1));
      } else {
        state.items.push({
          ...newItem,
          quantity: Math.min(newItem.maxQuantity, newItem.quantity || 1),
        });
      }
      saveCart(state.items);
    },
    updateQuantity(state, action) {
      const { slug, qty } = action.payload;
      const item = state.items.find((i) => i.slug === slug);
      if (item) {
        item.quantity = Math.max(1, Math.min(item.maxQuantity, qty));
      }
      saveCart(state.items);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.slug !== action.payload);
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartSavings = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.originalPrice - i.price) * i.quantity, 0);

export default cartSlice.reducer;
