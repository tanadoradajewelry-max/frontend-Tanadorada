import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";
import { formatPriceLPS } from "../../data/storeData";

const STATUS_LABELS = {
  new: "Nueva",
  link_sent: "Link enviado",
  paid: "Pagada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

const DELIVERY_LABELS = {
  personal: "Lo recibe quien compra, para entregarlo",
  direct: "Que se envíe directamente al destinatario",
};

const shortId = (id) => String(id).slice(-8).toUpperCase();

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// WhatsApp o correo, según cómo quiere recibirlo la clienta.
function contactLink(request) {
  if (request.receiveVia === "email") {
    return { href: `mailto:${request.contact}`, text: request.contact };
  }

  const digits = String(request.contact || "").replace(/\D/g, "");
  const number = digits.length === 8 ? `504${digits}` : digits;
  return {
    href: `https://wa.me/${number}`,
    text: `WhatsApp: ${request.contact}`,
  };
}

export default function AdminGiftCertificates() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

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
      .getGiftCertificates()
      .then((data) => {
        setRequests(data);
        setStatus("success");
      })
      .catch((err) => {
        if (handleAuthError(err)) return;
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id, nextStatus) => {
    const previous = requests;
    setRequests((current) =>
      current.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );

    try {
      await api.updateGiftCertificateStatus(id, nextStatus);
    } catch (err) {
      setRequests(previous);
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  };

  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 20 }}>
        <h2>Certificados de regalo</h2>
        <p>
          {requests.length} solicitudes
          {newCount > 0 && ` · ${newCount} nuevas`}
        </p>
      </div>

      <p className="admin-currency-hint" style={{ marginBottom: 20 }}>
        Cuando mandes el link de pago, cámbiala a <strong>Link enviado</strong>;
        al recibir el pago, <strong>Pagada</strong>; y al entregar el
        certificado, <strong>Entregada</strong>. El número (#) es el mismo que
        la clienta te manda por WhatsApp.
      </p>

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      )}
      {status === "success" && requests.length === 0 && (
        <p className="grid-status">Todavía no hay solicitudes.</p>
      )}

      {status === "success" && requests.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Solicitud</th>
              <th>Recibida</th>
              <th>De → Para</th>
              <th>Monto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const link = contactLink(r);

              return (
                <Fragment key={r.id}>
                  <tr>
                    <td>
                      <strong>#{shortId(r.id)}</strong>
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      {r.senderName} → {r.recipientName}
                    </td>
                    <td>{formatPriceLPS(r.amount)}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="admin-table-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === r.id ? null : r.id)
                        }
                      >
                        {expandedId === r.id ? "Ocultar" : "Ver detalle"}
                      </button>
                    </td>
                  </tr>

                  {expandedId === r.id && (
                    <tr>
                      <td colSpan={6} className="order-detail-row">
                        <dl className="admin-detail-list">
                          <dt>Para</dt>
                          <dd>{r.recipientName}</dd>
                          <dt>De parte de</dt>
                          <dd>{r.senderName}</dd>
                          <dt>Mensaje</dt>
                          <dd style={{ whiteSpace: "pre-wrap" }}>
                            {r.message || "—"}
                          </dd>
                          <dt>Modalidad de entrega</dt>
                          <dd>{DELIVERY_LABELS[r.delivery] || r.delivery}</dd>
                          <dt>Recibirlo por</dt>
                          <dd>
                            {r.receiveVia === "email" ? "Correo electrónico" : "WhatsApp"}
                          </dd>
                        </dl>

                        <div className="admin-detail-links">
                          <a href={link.href} target="_blank" rel="noreferrer">
                            {link.text}
                          </a>
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