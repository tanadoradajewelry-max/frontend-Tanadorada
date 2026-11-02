import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { formatPriceLPS } from "../../data/storeData";
import AdminNav from "../../components/admin/AdminNav";

const STATUS_LABELS = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  cancelled: "Cancelado",
  failed: "Falló",
};

// A qué estados se puede pasar desde cada uno. Un pedido pagado ya no se
// cambia (su stock ya se descontó).
const STATUS_OPTIONS = {
  pending: ["pending", "paid", "cancelled"],
  failed: ["failed", "pending", "paid", "cancelled"],
  cancelled: ["cancelled", "pending", "paid"],
};

const shortId = (id) => String(id).slice(-8).toUpperCase();

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Un número de 8 dígitos es de Honduras, se le agrega el 504.
function whatsappLink(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const number = digits.length === 8 ? `504${digits}` : digits;
  return `https://wa.me/${number}`;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const handleAuthError = (err) => {
    if (err.message.includes("Contraseña")) {
      localStorage.removeItem("tanadorada_admin_password");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  useEffect(() => {
    api
      .getOrders()
      .then((data) => {
        setOrders(data);
        setStatus("success");
      })
      .catch((err) => {
        if (handleAuthError(err)) return;
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (order, next) => {
    if (next === order.status) return;

    let question = null;
    if (next === "paid") {
      question =
        `¿Marcar el pedido de ${order.customerName} como PAGADO?\n\n` +
        "Se descuenta el stock y se le envía un correo de confirmación. " +
        "Un pedido pagado ya no se puede revertir desde el panel.";
    } else if (next === "cancelled") {
      question = `¿Cancelar el pedido de ${order.customerName}?`;
    }

    if (question && !window.confirm(question)) return;

    setUpdatingId(order.id);
    try {
      await api.updateOrderStatus(order.id, next);
      setOrders((current) =>
        current.map((o) => (o.id === order.id ? { ...o, status: next } : o))
      );
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 20 }}>
        <h2>Pedidos</h2>
        <p>
          {orders.length} pedidos registrados
          {pendingCount > 0 && ` · ${pendingCount} esperando pago`}
        </p>
      </div>

      <p className="admin-currency-hint" style={{ marginBottom: 20 }}>
        Cuando una clienta te pague con el link, cambia su pedido a{" "}
        <strong>Pagado</strong>: se descuenta el stock y recibe su confirmación
        por correo. El número de pedido (#) es el mismo que ella te manda por
        WhatsApp.
      </p>

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      )}

      {status === "success" && orders.length === 0 && (
        <p className="grid-status">Todavía no hay pedidos.</p>
      )}

      {status === "success" && orders.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const options = STATUS_OPTIONS[order.status];

              return (
                <Fragment key={order.id}>
                  <tr>
                    <td>
                      <strong>#{shortId(order.id)}</strong>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.customerName}
                      <br />
                      <span style={{ fontSize: 11, color: "#999" }}>
                        {order.email}
                      </span>
                    </td>
                    <td>{formatPriceLPS(order.subtotal)}</td>
                    <td>
                      {options ? (
                        <select
                          className="admin-status-select"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                        >
                          {options.map((value) => (
                            <option key={value} value={value}>
                              {STATUS_LABELS[value]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`order-status order-status--${order.status}`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      )}
                    </td>
                    <td className="admin-table-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === order.id ? null : order.id)
                        }
                      >
                        {expandedId === order.id ? "Ocultar" : "Ver detalle"}
                      </button>
                    </td>
                  </tr>

                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={6} className="order-detail-row">
                        <p>
                          <strong>Dirección:</strong> {order.address}, {order.city}
                        </p>
                        <ul style={{ marginTop: 8 }}>
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.title} × {item.quantity} —{" "}
                              {formatPriceLPS(item.price * item.quantity)}
                            </li>
                          ))}
                        </ul>

                        <div className="admin-detail-links">
                          <a href={whatsappLink(order.phone)} target="_blank" rel="noreferrer">
                            WhatsApp: {order.phone}
                          </a>
                          <a href={`mailto:${order.email}`}>{order.email}</a>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
