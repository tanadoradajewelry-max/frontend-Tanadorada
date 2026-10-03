// Lista única de categorías — se usa tanto en el <select> del panel
// admin como en las rutas de colección. Para agregar una categoría
// nueva (ej. "Pulseras"), solo agregas un objeto aquí, nada más.
export const CATEGORIES = [
  { slug: "anillos", label: "Anillos" },
  { slug: "collares", label: "Collares" },
  { slug: "aretes", label: "Aretes" },
];

export function getCategoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}