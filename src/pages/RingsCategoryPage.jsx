import { useEffect, useState } from "react";
import CategoryPage from "./CategoryPage";
import { api } from "../api/client";

// IDs reales de los anillos en la base de datos (se generan solos del
// título al crearlos en el panel admin: "Caramella Ring" -> "caramella-ring").
const RING_PRODUCT_IDS = [
  "caramella-ring",
  "olive-ring",
  "the-loop-ring",
  "velvet-ring",
];

export default function RingsCategoryPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all(RING_PRODUCT_IDS.map((id) => api.getProduct(id).catch(() => null)))
      .then((results) => {
        setProducts(results.filter(Boolean));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status grid-status--error">
          No se pudieron cargar los anillos.
        </p>
      </section>
    );
  }

  return <CategoryPage title="Anillos" products={products} />;
}
