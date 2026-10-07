import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatPriceLPS } from "../data/storeData";
import { useCartStore } from "../store/useCartStore";
import { useProduct } from "../hooks/useProduct";
import ProductGallery from "../components/ProductGallery";

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const { product, status } = useProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Al pasar de un producto a otro, la cantidad vuelve a 1.
  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
  }, [productId]);

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

  const handleAddToCart = () => {
    addItem(product, quantity);
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
          <p className="product-page-price">{formatPriceLPS(product.price)}</p>

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
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn btn--dark product-page-add"
            onClick={handleAddToCart}
          >
            {justAdded ? "Agregado ✓" : "Agregar al carrito"}
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
