import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import { useCurrency } from "../hooks/useCurrency";
import { getPriceRange } from "../utils/productSizes";
import { isSoldOut } from "../utils/stock";

export default function CollectionPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  const { getLabel } = useCategories();

  // La colección activa vive en la dirección: ?coleccion=la-dolce-vita
  const activeCollection = searchParams.get("coleccion");
  const selectCollection = (id) =>
    setSearchParams(id ? { coleccion: id } : {}, { replace: true });

  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.getCollections(categorySlug).then(setCollections).catch(() => {});
  }, [categorySlug]);

  useEffect(() => {
    setStatus("loading");
    api
      .getProducts(categorySlug, activeCollection)
      .then((data) => {
        setProducts(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [categorySlug, activeCollection]);

  return (
    <section className="normal-flow-section category-page">
       <h1 className="category-page-title">{getLabel(categorySlug)}</h1>

      {collections.length > 0 && (
        <div className="collection-tabs">
          <button
            type="button"
            className={`collection-tab ${activeCollection === null ? "collection-tab--active" : ""}`}
            onClick={() => selectCollection(null)}
          >
            Todas
          </button>
          {collections.map((col) => (
            <button
              type="button"
              key={col.id}
              className={`collection-tab ${activeCollection === col.id ? "collection-tab--active" : ""}`}
              onClick={() => selectCollection(col.id)}
            >
              {col.name}
            </button>
          ))}
        </div>
      )}

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
          {products.map((product) => {
            const range = getPriceRange(product);
            const soldOut = isSoldOut(product);

            return (
              <div
                className={`product-card-item ${soldOut ? "product-card-item--sold-out" : ""}`}
                key={product.id}
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                <div className="product-card-image">
                  {soldOut ? (
                    <span className="badge-tag badge-tag--sold-out">Agotado</span>
                  ) : (
                    product.badge && (
                      <span className="badge-tag">{product.badge}</span>
                    )
                  )}
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="product-info-title">{product.title}</div>
                <div className="product-info-price">
                  {range.hasRange && "Desde "}
                  {formatPrice(range.min)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
