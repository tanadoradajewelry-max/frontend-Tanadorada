import { navLinks } from "../data/storeData";

export const MAX_MENU_ITEMS = 8;
export const MAX_LABEL_CHARS = 30;

const CACHE_KEY = "tanadorada_nav_menu";

// Solo se permiten enlaces internos (/...), anclas (#...) o https://...
// Cualquier otra cosa (por ejemplo "javascript:...") se descarta, para que
// un dato mal guardado nunca pueda ejecutar código en la tienda.
// Tampoco se aceptan "//sitio.com" ni "/\sitio.com", que el navegador
// interpreta como un sitio externo.
const SAFE_HREF = /^(?:\/(?![\/\\])[^\s\\]*|#[^\s]*|https?:\/\/[^\s]+)$/i;

export function isSafeHref(href) {
  return typeof href === "string" && SAFE_HREF.test(href.trim());
}

// El menú de siempre (el que está en storeData.js), sin las fotos.
export function defaultMenu() {
  return navLinks.map(({ label, href }) => ({ label, href }));
}

// Deja solo enlaces válidos: con nombre, con destino seguro, máximo 8.
export function cleanMenu(list) {
  if (!Array.isArray(list)) return [];

  const result = [];

  for (const item of list) {
    const label = String(item?.label ?? "").trim().slice(0, MAX_LABEL_CHARS);
    const href = String(item?.href ?? "").trim();

    if (!label || !isSafeHref(href)) continue;

    result.push({ label, href });
    if (result.length === MAX_MENU_ITEMS) break;
  }

  return result;
}

// El menú se recuerda en el navegador para que no parpadee al cargar.
export function readMenuCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cleaned = raw ? cleanMenu(JSON.parse(raw)) : [];
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}

export function writeMenuCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function clearMenuCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}