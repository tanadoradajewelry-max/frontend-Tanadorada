import { create } from "zustand";

const MAX_QUANTITY = 99; // el servidor acepta de 1 a 99 por producto

// Cada renglón de la bolsa es producto + talla: el mismo anillo en talla 6
// y en talla 7 son dos renglones distintos.
export const lineKey = (id, sizeLabel) => `${id}::${sizeLabel || ""}`;

export const useCartStore = create((set, get) => ({
  items: [], // [{ key, id, title, size, price, image, quantity }]

  // "size" es la talla elegida ({ label, price }), o null si el producto
  // no tiene tallas. El precio aquí es solo para mostrar: el cobro real lo
  // calcula el servidor.
  addItem: (product, quantity = 1, size = null) => {
    const key = lineKey(product.id, size?.label);

    set((state) => {
      const existing = state.items.find((item) => item.key === key);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: Math.min(MAX_QUANTITY, item.quantity + quantity),
                }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            key,
            id: product.id,
            title: product.title,
            size: size?.label || null,
            price: size ? size.price : product.price,
            image: product.image || product.images?.[0] || "",
            quantity: Math.min(MAX_QUANTITY, quantity),
          },
        ],
      };
    });
  },

  removeItem: (key) => {
    set((state) => ({
      items: state.items.filter((item) => item.key !== key),
    }));
  },

  updateQuantity: (key, quantity) => {
    if (quantity < 1) {
      get().removeItem(key);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }
          : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
