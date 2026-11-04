import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { slugify } from "../../utils/slugify";
import { useCategories } from "../../hooks/useCategories";

// Lista de destinos válidos para los campos "A dónde lleva" del panel.
// No se ve en pantalla: solo alimenta las sugerencias de esos campos.
export default function LinkSuggestions({ id = "admin-link-options" }) {
  const { categories } = useCategories();
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    api
      .getCollections()
      .then(setCollections)
      .catch(() => {});
  }, []);

  // Una opción por nombre: "La Dolce Vita" sale una sola vez aunque exista
  // en varias categorías.
  const groups = new Map();
  for (const collection of collections) {
    const key = slugify(collection.name);
    if (key && !groups.has(key)) groups.set(key, collection.name);
  }

  return (
    <datalist id={id}>
      <option value="/" label="Inicio" />
      {categories.map((category) => (
        <option
          key={category.slug}
          value={`/coleccion/${category.slug}`}
          label={`Categoría: ${category.label}`}
        />
      ))}
      {[...groups].map(([slug, name]) => (
        <option
          key={slug}
          value={`/colecciones/${slug}`}
          label={`Colección: ${name}`}
        />
      ))}
    </datalist>
  );
}