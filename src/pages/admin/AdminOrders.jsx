import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { formatPriceLPS } from "../../data/storeData";
import AdminNav from "../../components/admin/AdminNav";

const statusLabels = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Falló",
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getOrders()
      .then((data) => {
        setOrders(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.message.includes("Contraseña")) {
          localStorage.removeItem("tanadorada_admin_password");
          navigate("/admin/login");
          return;
        }
        setStatus("error");
      });
  }, [navigate]);

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 20 }}>
        <h2>Pedidos</h2>
        <p>{orders.length} pedidos registrados</p>
      </div>

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
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Fragment key={order.id}>
                <tr>
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
                    <span className={`order-status order-status--${order.status}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
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
                    <td colSpan={5} className="order-detail-row">
                      <p>
                        <strong>Teléfono:</strong> {order.phone}
                      </p>
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
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
