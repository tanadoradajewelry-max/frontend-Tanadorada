import { formatPriceLPS } from "../data/storeData";

export default function CategoryPage({ title, products }) {
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

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card-item" key={product.id}>
            <div className="product-card-image">
              <img src={product.image} alt={product.title} />
            </div>
            <div className="product-info-title">{product.title}</div>
            <div className="product-info-price">
              {formatPriceLPS(product.price)}
            </div>
          </div>
        ))}
      </div>

      <p className="category-page-note">
        * Productos de ejemplo — pronto disponibles para compra
      </p>
    </section>
  );
}