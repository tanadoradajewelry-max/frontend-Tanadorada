import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { formatPriceLPS } from "../data/storeData";
import { getCategoryLabel } from "../data/categories";

export default function CollectionPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    api
      .getProducts(categorySlug)
      .then((data) => {
        setProducts(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [categorySlug]);

  return (
    <section className="normal-flow-section category-page">
      <h1 className="category-page-title">{getCategoryLabel(categorySlug)}</h1>

      <div className="category-page-toolbar">
        <span className="category-page-sort">Más vendidos ⌄</span>
        <div className="category-page-view-icons" aria-hidden="true">
          <span>▤</span>
          <span>▥</span>
          <span className="category-page-view-icons--active">▦</span>
        </div>
      </div>

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudieron cargar los productos.
        </p>
      )}
      {status === "success" && products.length === 0 && (
        <p className="grid-status">Muy pronto vas a encontrar piezas aquí</p>
      )}

      {status === "success" && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <div
              className="product-card-item"
              key={product.id}
              onClick={() => navigate(`/producto/${product.id}`)}
            >
              <div className="product-card-image">
                {product.badge && (
                  <span className="badge-tag">{product.badge}</span>
                )}
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-info-title">{product.title}</div>
              <div className="product-info-price">
                {formatPriceLPS(product.price)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}