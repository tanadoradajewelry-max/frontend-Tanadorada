import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useCartStore } from "../store/useCartStore";
import { formatPriceLPS } from "../data/storeData";

const REDIRECT_SECONDS = 6;

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();
  const hasCaptured = useRef(false);

  const [status, setStatus] = useState("capturing"); // capturing | paid | failed | error
  const [order, setOrder] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  // Captura el pago UNA sola vez. Ya no usamos la bandera "cancelled" de
  // antes porque chocaba con este guard: en desarrollo, React ejecuta este
  // efecto dos veces (StrictMode) — la primera vez dispara la captura real,
  // la segunda entra aquí y se detiene de inmediato sin volver a llamar
  // nada. Antes, la limpieza de la primera ejecución marcaba "cancelled"
  // y la respuesta real llegaba pero se ignoraba, dejando la pantalla
  // pegada en "Confirmando tu pago...".
  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    if (hasCaptured.current) return;
    hasCaptured.current = true;

        const paymentHash = searchParams.get("paymentHash");

    api
      .captureOrder(orderId, paymentHash)
      .then(async (result) => {
        if (result.status === "paid") {
          clearCart();
          const fullOrder = await api.getOrder(orderId);
          setOrder(fullOrder);
          setStatus("paid");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [orderId, clearCart]);

  // Una vez confirmado el pago, cuenta regresiva y redirección automática
  // de vuelta a la tienda.
  useEffect(() => {
    if (status !== "paid") return;

    if (secondsLeft <= 0) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, secondsLeft, navigate]);

  if (status === "capturing") {
    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>Confirmando tu pago…</h2>
          <p>Esto toma unos segundos, no cierres esta página</p>
        </div>
      </section>
    );
  }

  if (status === "paid") {
    return (
      <section className="normal-flow-section">
        <div className="section-header">
          <h2>¡Gracias por tu compra!</h2>
          <p>Tu pedido #{order?.id.slice(-8)} fue confirmado</p>
        </div>

        {order && (
          <div className="checkout-summary" style={{ maxWidth: 500, margin: "0 auto" }}>
            <h3>Resumen</h3>
            <ul className="checkout-summary-list">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.title} × {item.quantity}
                  </span>
                  <span>{formatPriceLPS(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="cart-summary-row">
              <span>Total pagado</span>
              <span>{formatPriceLPS(order.subtotal)}</span>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 24 }}>
          Te regresamos a la tienda en {secondsLeft}s…
        </p>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link to="/" className="btn btn--dark">
            Seguir comprando ahora
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>No pudimos confirmar tu pago</h2>
               <p>
          Si ya te cobraron y ves este mensaje, contáctanos por WhatsApp
          con tu número de orden para verificarlo manualmente.
        </p>
      </div>
      <div style={{ textAlign: "center" }}>
        <Link to="/carrito" className="btn btn--dark">
          Volver a la bolsa
        </Link>
      </div>
    </section>
  );
}