const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getAdminPassword() {
  return localStorage.getItem("tanadorada_admin_password") || "";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error ${response.status} en ${path}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// Igual que request(), pero manda la contraseña de admin en el header
// que espera el middleware requireAdmin del backend.
async function adminRequest(path, options = {}) {
  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      "x-admin-password": getAdminPassword(),
    },
  });
}

export const api = {
  getProducts: (category, collection) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (collection) params.set("collection", collection);
    const qs = params.toString();
    return request(qs ? `/api/products?${qs}` : "/api/products");
  },
  getProduct: (id) => request(`/api/products/${id}`),
  createOrder: (payload) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  captureOrder: (orderId, paymentHash) =>
    request(`/api/orders/${orderId}/capture`, {
      method: "POST",
      body: JSON.stringify({ paymentHash }),
    }),

  getOrder: (orderId) => request(`/api/orders/${orderId}`),
  getOrders: () => adminRequest("/api/orders"),

  // --- Contenido de la portada ---
  getContent: () => request("/api/content"),
  updateContent: (key, value) =>
    adminRequest(`/api/content/${key}`, {
      method: "PUT",
      body: JSON.stringify(value),
    }),

  // --- Colecciones (La Dolce Vita, Muza & Gala, etc.) ---
  getCollections: (category) =>
    request(
      category
        ? `/api/collections?category=${encodeURIComponent(category)}`
        : "/api/collections"
    ),
  createCollection: (name, category) =>
    adminRequest("/api/collections", {
      method: "POST",
      body: JSON.stringify({ name, category }),
    }),
  deleteCollection: (id) =>
    adminRequest(`/api/collections/${id}`, { method: "DELETE" }),

  // --- Admin: productos ---
  createProduct: (data) =>
    adminRequest("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id, data) =>
    adminRequest(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id) =>
    adminRequest(`/api/products/${id}`, { method: "DELETE" }),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { "x-admin-password": getAdminPassword() },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "No se pudo subir la imagen");
    }

    return response.json(); // { url }
  },

  // Pregunta al servidor si la contraseña es válida.
  // true = válida, false = incorrecta. Si el servidor no responde,
  // lanza error (así el guardia no te saca de la sesión por una caída).
  verifyAdminPassword: async (password) => {
    const response = await fetch(`${API_URL}/api/admin/verify`, {
      headers: { "x-admin-password": password },
    });
    return response.ok;
  },
};
