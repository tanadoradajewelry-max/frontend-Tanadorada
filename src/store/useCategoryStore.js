import { create } from "zustand";
import { api } from "../api/client";
import { DEFAULT_CATEGORIES } from "../data/categories";

const CACHE_KEY = "tanadorada_categories";

export const MAX_CATEGORIES = 20;
export const MAX_CATEGORY_LABEL = 30;

// Dirección válida: minúsculas, números y guiones. Máximo 50 caracteres,
// que es lo que aguantan las columnas de la base de datos.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Deja solo categorías válidas, sin direcciones repetidas.
export function normalizeCategories(list) {
  if (!Array.isArray(list)) return [];

  const seen = new Set();
  const result = [];

  for (const item of list) {
    const slug = String(item?.slug ?? "").trim();
    const label = String(item?.label ?? "").trim().slice(0, MAX_CATEGORY_LABEL);

    if (!label || slug.length > 50 || !SLUG_PATTERN.test(slug) || seen.has(slug)) {
      continue;
    }

    seen.add(slug);
    result.push({ slug, label });
    if (result.length === MAX_CATEGORIES) break;
  }

  return result;
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const list = raw ? normalizeCategories(JSON.parse(raw)) : [];
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export const useCategoryStore = create((set, get) => ({
  // Se arranca con lo último guardado en el navegador para que no parpadee;
  // enseguida se actualiza con lo que hay en el panel.
  categories: readCache() || DEFAULT_CATEGORIES,
  loaded: false,

  loadCategories: async () => {
    if (get().loaded) return;
    set({ loaded: true });

    try {
      const saved = normalizeCategories(await api.getContentBlock("categories"));

      if (saved.length > 0) {
        writeCache(saved);
        set({ categories: saved });
      } else {
        clearCache();
        set({ categories: DEFAULT_CATEGORIES });
      }
    } catch {
      /* sin conexión: se queda con lo último que se vio */
    }
  },

  // Lo usa el panel justo después de guardar, para que todo se actualice
  // al instante sin recargar.
  setCategories: (list) => {
    const clean = normalizeCategories(list);
    if (clean.length === 0) return;
    writeCache(clean);
    set({ categories: clean });
  },
}));