import { useNavigate } from "react-router-dom";
import { formatPriceLPS } from "../data/storeData";

export default function CategoryPage({ title, products }) {
  const navigate = useNavigate();

  return (
    <section className="normal-flow-section category-page">
      <h1 className="category-page-title">{title}</h1>

      <div className="category-page-toolbar">
        <span className="category-page-sort">Más vendidos ⌄</span>
        <div className="category-page-view-icons" aria-hidden="true">
          <span>▤</span>
          <span>▥</span>
          <span className="category-page-view-icons--active">▦</span>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="grid-status">Muy pronto vas a encontrar piezas aquí</p>
      ) : (
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
