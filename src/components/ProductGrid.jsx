import { useNavigate } from "react-router-dom";
import Reveal from "./Reveal";
import { formatPriceLPS } from "../data/storeData";
import { useProducts } from "../hooks/useProducts";
import { PRICE_RANGES } from "./ShopByPrice";

export default function ProductGrid({ priceRange = "all" }) {
  const navigate = useNavigate();
  const { products, status, error } = useProducts();

  const activeRange = PRICE_RANGES.find((r) => r.id === priceRange);
  const filteredProducts =
    activeRange && activeRange.test
      ? products.filter((p) => activeRange.test(p.price))
      : products;

  return (
    <>
      <Reveal as="div" className="section-header">
        <h2>Best Sellers</h2>
        <p>Nuestras piezas más queridas y buscadas</p>
      </Reveal>

      {status === "loading" && (
        <p className="grid-status">Cargando productos…</p>
      )}

      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudieron cargar los productos ({error}). Verifica que el
          backend esté corriendo en {import.meta.env.VITE_API_URL}.
        </p>
      )}

      {status === "success" && filteredProducts.length === 0 && (
        <p className="grid-status">No hay productos en este rango de precio.</p>
      )}

      {status === "success" && filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <Reveal
              as="div"
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
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}