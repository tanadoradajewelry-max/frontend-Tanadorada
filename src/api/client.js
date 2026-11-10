const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const TIMEOUT_MS = 15000; // peticiones normales
const UPLOAD_TIMEOUT_MS = 60000; // subir una foto puede tardar más

function getAdminPassword() {
  return localStorage.getItem("tanadorada_admin_password") || "";
}

async function request(path, options = {}) {
  const headers = { ...options.headers };

  // Solo se manda Content-Type cuando hay cuerpo (POST/PUT).
  // Así los GET públicos no generan preflight (petición OPTIONS extra).
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Si quien llama pasa su propio signal (como el buscador), también se respeta.
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else
      options.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError" && !options.signal?.aborted) {
      throw new Error(
        "El servidor tardó demasiado en responder. Intenta de nuevo."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

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

  // Números para las tarjetas del panel de inicio (solo admin)
  getAdminSummary: () => adminRequest("/api/admin/summary"),

  // Dirección de una foto del producto, servida como imagen real
  // (0 = principal, 1 = segunda…). El navegador la guarda en memoria.
  productImageUrl: (id, index) =>
    `${API_URL}/api/products/${encodeURIComponent(id)}/image/${index}`,

  // Buscador de la tienda: devuelve { results, total }
  searchProducts: (term, options) =>
    request(`/api/products/search?q=${encodeURIComponent(term)}`, options),

  createOrder: (payload) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getOrders: () => adminRequest("/api/orders"),
  updateOrderStatus: (orderId, status) =>
    adminRequest(`/api/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // --- Contenido de la portada ---
  getContent: () => request("/api/content"), // todos los bloques (la portada)
  getContentBlock: (key) => request(`/api/content/${key}`), // uno solo (el menú)
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

  // --- Certificados de regalo ---
  createGiftCertificate: (payload) =>
    request("/api/gift-certificates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getGiftCertificates: () => adminRequest("/api/gift-certificates"),
  updateGiftCertificateStatus: (id, status) =>
    adminRequest(`/api/gift-certificates/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // --- Charm Bar ---
  createCharmBarRequest: (payload) =>
    request("/api/charm-bar", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getCharmBarRequests: () => adminRequest("/api/charm-bar"),
  updateCharmBarStatus: (id, status) =>
    adminRequest(`/api/charm-bar/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

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

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { "x-admin-password": getAdminPassword() },
        body: formData,
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("La subida tardó demasiado. Intenta de nuevo.");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        headers: { "x-admin-password": password },
        signal: controller.signal,
      });
      return response.ok;
    } finally {
      clearTimeout(timer);
    }
  },
};
