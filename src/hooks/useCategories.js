import { useEffect } from "react";
import { useCategoryStore } from "../store/useCategoryStore";

// Devuelve las categorías de la tienda y una función para sacar el nombre
// que se ve a partir de la dirección ("anillos" -> "Anillos").
export function useCategories() {
  const categories = useCategoryStore((state) => state.categories);
  const loadCategories = useCategoryStore((state) => state.loadCategories);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const getLabel = (slug) =>
    categories.find((c) => c.slug === slug)?.label || slug;

  return { categories, getLabel };
}