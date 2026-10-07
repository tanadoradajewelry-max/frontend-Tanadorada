import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [], // [{ id, title, price, image, quantity }]

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image || product.images?.[0] || "",
            quantity,
          },
        ],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
