import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { slugify } from "../utils/slugify";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";

// Muestra TODOS los productos de una colección, sin importar su categoría.
// La dirección sale del nombre: "La Dolce Vita" -> /colecciones/la-dolce-vita
export default function CollectionGroupPage() {
  const { groupSlug } = useParams();
  const { categories } = useCategories();

  const [name, setName] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | not-found | error
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setActiveCategory(null);

    async function load() {
      try {
        const allCollections = await api.getCollections();

        // Todas las colecciones que se llaman igual, de cualquier categoría.
        const matches = allCollections.filter(
          (collection) => slugify(collection.name) === groupSlug
        );

        if (matches.length === 0) {
          if (!cancelled) setStatus("not-found");
          return;
        }

        const lists = await Promise.all(
          matches.map((collection) => api.getProducts(null, collection.id))
        );

        if (cancelled) return;

        const merged = lists
          .flat()
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setName(matches[0].name);
        setProducts(merged);
        setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [groupSlug]);

  // Solo las categorías que de verdad tienen productos en esta colección.
  const presentCategories = useMemo(
    () =>
      categories.filter((category) =>
        products.some((product) => product.category === category.slug)
      ),
    [categories, products]
  );

  const visibleProducts = activeCategory
    ? products.filter((product) => product.category === activeCategory)
    : products;

  if (status === "loading") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  if (status === "not-found") {
    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>No encontramos esta colección</h2>
          <p>Puede que el enlace esté roto o que la colección ya no exista</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" className="btn btn--dark">
            Volver a la tienda
          </Link>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status grid-status--error">
          No se pudo cargar esta colección. Intenta de nuevo en un momento.
        </p>
      </section>
    );
  }

  return (
    <section className="normal-flow-section category-page">
      <h1 className="category-page-title">{name}</h1>

      {presentCategories.length > 1 && (
        <div className="collection-tabs">
          <button
            type="button"
            className={`collection-tab ${activeCategory === null ? "collection-tab--active" : ""}`}
            onClick={() => setActiveCategory(null)}
          >
            Todas
          </button>

          {presentCategories.map((category) => (
            <button
              type="button"
              key={category.slug}
              className={`collection-tab ${activeCategory === category.slug ? "collection-tab--active" : ""}`}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {visibleProducts.length === 0 ? (
        <p className="grid-status">Muy pronto vas a encontrar piezas aquí</p>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}