import { create } from "zustand";

// Store único del carrito, compartido entre Header, Home, ProductPage,
// Cart y Checkout. Cuando conectemos el backend, "checkout" es el único
// método que cambia: en vez de solo vaciar el carrito, primero hace el
// POST a /api/orders y espera confirmación de pago antes de vaciar.
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
            image: product.image,
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

  // Selectores derivados como funciones normales (no hooks) para
  // usarlos dentro de otros métodos del store sin re-renders extra.
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
