// Lista única de categorías — se usa tanto en el <select> del panel
// admin como en las rutas de colección. Para agregar una categoría
// nueva (ej. "Pulseras"), solo agregas un objeto aquí, nada más.
// Categorías de RESPALDO. Las categorías reales se administran en el panel
// (pestaña Categorías) y se guardan en la base de datos. Esta lista solo se
// usa mientras no hayas guardado ninguna, o si falla la conexión.
export const DEFAULT_CATEGORIES = [
  { slug: "anillos", label: "Anillos" },
  { slug: "collares", label: "Collares" },
  { slug: "aretes", label: "Aretes" },
  { slug: "pulseras", label: "Pulseras" },
];

// Se dejan solo para que ningún archivo viejo que todavía los importe se
// rompa. NO los uses en pantallas nuevas: usa useCategories().
export const CATEGORIES = DEFAULT_CATEGORIES;

export function getCategoryLabel(slug) {
  return DEFAULT_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
