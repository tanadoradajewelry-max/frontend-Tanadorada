import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { formatPriceLPS } from "../data/storeData";
import { api } from "../api/client";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
};

export default function Checkout() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const isSubmittingRef = useRef(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Bloqueo inmediato con ref (no depende de que React re-renderice el
    // botón como disabled, que puede tardar una fracción de segundo y
    // dejar pasar un doble clic muy rápido).
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { approveUrl } = await api.createOrder({
        customer: form,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

           if (!approveUrl) {
        throw new Error("No se recibió el link de pago");
      }

      // El carrito se vacía cuando vuelva ya pagado a /gracias,
      // no acá, por si cancela el pago y necesita volver a intentar.
      window.location.href = approveUrl;
    } catch (error) {
      setErrorMessage(
        error.message || "No se pudo iniciar el pago. Intenta de nuevo."
      );
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>No hay nada que pagar todavía</h2>
          <p>Tu bolsa está vacía</p>
        </div>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>Checkout</h2>
        <p>Completa tus datos de envío</p>
      </div>

      <div className="checkout-page">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Teléfono / WhatsApp
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Dirección
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Ciudad
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>

          {errorMessage && (
            <p className="grid-status grid-status--error">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="btn btn--dark checkout-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Conectando con PayPal…" : "Ir a pagar"}
          </button>

          <button
            type="button"
            className="product-page-back"
            onClick={() => navigate("/carrito")}
          >
            &larr; Volver a la bolsa
          </button>
        </form>

        <aside className="checkout-summary">
          <h3>Resumen del pedido</h3>
          <ul className="checkout-summary-list">
            {items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>{formatPriceLPS(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-summary-row">
            <span>Total</span>
            <span>{formatPriceLPS(subtotal)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}