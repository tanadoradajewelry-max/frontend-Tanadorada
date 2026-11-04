import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { formatPriceLPS } from "../data/storeData";
import { api } from "../api/client";

const LAST_ORDER_KEY = "tanadorada_last_order";

// Solo se acepta ir a enlaces de WhatsApp, nunca a otro sitio.
const isWhatsappUrl = (url) =>
  typeof url === "string" && url.startsWith("https://wa.me/");

// Se recuerda el último pedido mientras la pestaña siga abierta, por si la
// clienta vuelve atrás desde WhatsApp y necesita abrirlo otra vez.
function saveLastOrder(order) {
  try {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function readLastOrder() {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data.orderId === "string" && isWhatsappUrl(data.whatsappUrl)
      ? data
      : null;
  } catch {
    return null;
  }
}

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
  const clearCart = useCartStore((state) => state.clearCart);
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

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { orderId, whatsappUrl } = await api.createOrder({
        customer: form,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
        })),
      });

      // 🛠️ PARCHE: Agregamos los datos en el orden solicitado
      let finalWhatsappUrl = whatsappUrl;
      try {
        const urlObj = new URL(whatsappUrl);
        let text = urlObj.searchParams.get("text") || "";
        
        // Verificamos que no estén ya para evitar duplicados
        if (form.address && form.city && !text.includes(form.address)) {
          text += `\n\n--- Datos de envío ---`;
          text += `\nNombre: ${form.name}`;
          text += `\nCiudad: ${form.city}`;
          text += `\nDirección de entrega: ${form.address}`;
          text += `\nNúmero de quien recibe: ${form.phone}`;
          
          urlObj.searchParams.set("text", text);
          finalWhatsappUrl = urlObj.toString();
        }
      } catch (err) {
        console.error("Error al agregar datos al link de WhatsApp", err);
      }

      if (!isWhatsappUrl(finalWhatsappUrl)) {
        throw new Error("No se pudo preparar el mensaje de WhatsApp");
      }

      // El pedido ya quedó guardado: se vacía la bolsa y se abre WhatsApp.
      saveLastOrder({ orderId, whatsappUrl: finalWhatsappUrl });
      clearCart();
      window.location.href = finalWhatsappUrl;
    } catch (error) {
      setErrorMessage(
        error.message || "No se pudo enviar el pedido. Intenta de nuevo."
      );
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (items.length === 0) {
    const lastOrder = readLastOrder();

    if (lastOrder) {
      return (
        <section className="normal-flow-section">
          <div className="section-header">
            <h2>Pedido registrado</h2>
            <p>Pedido #{lastOrder.orderId.slice(-8).toUpperCase()}</p>
          </div>

          <div className="checkout-sent">
            <p>
              Para recibir tu link de pago con tarjeta, envíanos el mensaje por
              WhatsApp. Si no se abrió, toca el botón.
            </p>

            <a
              href={lastOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--dark"
            >
              Abrir WhatsApp
            </a>

            <Link to="/" className="product-page-back">
              &larr; Seguir comprando
            </Link>
          </div>
        </section>
      );
    }

    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>No hay nada que pagar todavía</h2>
          <p>Tu bolsa está vacía</p>
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
            {isSubmitting ? "Preparando tu pedido…" : "Enviar pedido por WhatsApp"}
          </button>

          <p className="checkout-note">
            Al enviar tu pedido por WhatsApp, podrás elegir tu método de pago: tarjeta de crédito o débito mediante un link de pago, o transferencia bancaria. Te compartiremos toda la información y los datos necesarios por WhatsApp para completar tu compra.
          </p>

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
              <li key={item.key}>
                <span>
                  {item.title}
                  {item.size ? ` · Talla ${item.size}` : ""} × {item.quantity}
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
