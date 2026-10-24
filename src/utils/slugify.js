// "Pulseras de oro" -> "pulseras-de-oro" (sin acentos ni símbolos).
// Hace lo mismo que el backend con los títulos de productos.
export function slugify(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}