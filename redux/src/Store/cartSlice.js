import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalAmount: 0,
};

const calcTotal = (items) =>
  items.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    add(state, action) {
      const existing = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1,
        });
      }

      state.totalAmount = calcTotal(state.items);
    },

    remove(state, action) {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );

      state.totalAmount = calcTotal(state.items);
    },

    increment(state, action) {
      const item = state.items.find(
        (item) => item.id === action.payload
      );

      if (item) {
        item.quantity += 1;
      }

      state.totalAmount = calcTotal(state.items);
    },

    decrement(state, action) {
      const item = state.items.find(
        (item) => item.id === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }

      state.totalAmount = calcTotal(state.items);
    },

    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  add,
  remove,
  increment,
  decrement,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;