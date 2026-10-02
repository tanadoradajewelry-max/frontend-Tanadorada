import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { formatPriceLPS } from "../data/storeData";


export default function Cart() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>Tu bolsa está vacía</h2>
          <p>Agrega algunas piezas para verlas aquí</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" className="btn btn--dark">
            Ir a la tienda
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>Tu Bolsa</h2>
        <p>Revisa tus piezas antes de continuar</p>
      </div>

      <div className="cart-page">
        <ul className="cart-list">
          {items.map((item) => (
            <li className="cart-line" key={item.id}>
              <img
                alt={item.title}
                className="cart-line-image"
              />

              <div className="cart-line-info">
                <div className="product-info-title">{item.title}</div>
                <div className="product-info-price">
                  {formatPriceLPS(item.price)}
                </div>
              </div>

              <div className="quantity-selector">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="cart-line-remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Quitar ${item.title}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPriceLPS(subtotal)}</span>
          </div>
          <p className="cart-summary-note">
            Envío y cualquier descuento se calculan en el checkout
          </p>
          <button
            type="button"
            className="btn btn--dark cart-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Continuar al Checkout
          </button>
        </div>
      </div>
    </section>
  );
}
