import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useProduct } from "../hooks/useProduct";
import { useCurrency } from "../hooks/useCurrency";
import ProductGallery from "../components/ProductGallery";
import { getSizes, getPriceRange } from "../utils/productSizes";
import { isSoldOut, getMaxQuantity } from "../utils/stock";

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { currency, isConverted, formatPrice, formatHnl } = useCurrency();

  const { product, status } = useProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showSizeError, setShowSizeError] = useState(false);

  // Al pasar de un producto a otro, todo vuelve a empezar.
  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
    setSelectedLabel(null);
    setShowSizeError(false);
  }, [productId]);

  // Si el producto tiene una sola talla, ya viene elegida.
  useEffect(() => {
    const only = getSizes(product);
    if (only.length === 1) setSelectedLabel(only[0].label);
  }, [product]);

  if (status === "loading") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Cargando producto…</p>
      </section>
    );
  }

  if (status === "not-found" || !product) {
    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>Producto no encontrado</h2>
          <p>Puede que el enlace esté roto o el producto ya no exista</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" className="btn btn--dark">
            Volver a la tienda
          </Link>
        </div>
      </section>
    );
  }

  // Si el producto no tiene galería, se usa su foto única de siempre.
  const images = product.images?.length ? product.images : [product.image];

  const sizes = getSizes(product);
  const hasSizes = sizes.length > 0;
  const selectedSize = sizes.find((s) => s.label === selectedLabel) || null;
  const range = getPriceRange(product);

  // Stock: agotado = no se puede agregar; si no, la cantidad tiene tope.
  const soldOut = isSoldOut(product);
  const maxQuantity = getMaxQuantity(product);

  // Con talla elegida se muestra su precio; sin elegir, el más bajo
  // (con "Desde" si las tallas no cuestan lo mismo).
  const shownPrice = selectedSize ? selectedSize.price : range.min;
  const showFrom = hasSizes && !selectedSize && range.hasRange;

  const handleAddToCart = () => {
    if (soldOut) return;

    if (hasSizes && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    addItem(product, Math.min(quantity, maxQuantity), selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <section className="normal-flow-section">
      <div className="product-page">
        <ProductGallery
          key={product.id}
          images={images}
          title={product.title}
          badge={product.badge}
        />

        <div className="product-page-info">
          <h1 className="product-page-title">{product.title}</h1>
          <p className="product-page-price">
            {showFrom && "Desde "}
            {formatPrice(shownPrice)}
          </p>

          {isConverted && (
            <p className="price-note">
              Precio de referencia en {currency.code}. El cobro se hace en
              lempiras ({formatHnl(shownPrice)}).
            </p>
          )}

          {hasSizes && !soldOut && (
            <div className="size-picker">
              <div className="size-picker-head">
                <span className="size-picker-label">
                  Talla{selectedSize ? `: ${selectedSize.label}` : ""}
                </span>
                {showSizeError && !selectedSize && (
                  <span className="size-picker-error">Elige tu talla</span>
                )}
              </div>

              <div className="size-picker-options" role="radiogroup" aria-label="Talla">
                {sizes.map((size) => {
                  const isActive = size.label === selectedLabel;

                  return (
                    <button
                      type="button"
                      key={size.label}
                      role="radio"
                      aria-checked={isActive}
                      className={`size-option ${isActive ? "size-option--active" : ""}`}
                      onClick={() => {
                        setSelectedLabel(size.label);
                        setShowSizeError(false);
                      }}
                    >
                      <span>{size.label}</span>
                      {range.hasRange && (
                        <span className="size-option-price">
                          {formatPrice(size.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!soldOut && (
            <div className="quantity-selector">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          )}

          {!soldOut && maxQuantity < 99 && quantity >= maxQuantity && (
            <p className="price-note">Es la cantidad máxima disponible.</p>
          )}

          <button
            type="button"
            className="btn btn--dark product-page-add"
            disabled={soldOut}
            onClick={handleAddToCart}
          >
            {soldOut
              ? "Agotado"
              : justAdded
                ? "Agregado ✓"
                : "Agregar al carrito"}
          </button>

          <button
            type="button"
            className="product-page-back"
            onClick={() => navigate(-1)}
          >
            &larr; Seguir viendo la tienda
          </button>
        </div>
      </div>
    </section>
  );
}
