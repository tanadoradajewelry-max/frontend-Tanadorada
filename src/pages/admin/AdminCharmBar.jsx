import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";

const STATUS_LABELS = {
  new: "Nueva",
  contacted: "Contactada",
  closed: "Cerrada",
};

// "2026-12-05" -> "05/12/2026" (sin pasar por Date, para que la zona
// horaria nunca cambie el día).
function formatEventDate(value) {
  const [year, month, day] = String(value).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Un número de 8 dígitos es de Honduras, se le agrega el 504.
function whatsappLink(phone) {
  const digits = String(phone).replace(/\D/g, "");
  const number = digits.length === 8 ? `504${digits}` : digits;
  return `https://wa.me/${number}`;
}

export default function AdminCharmBar() {
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
      .getCharmBarRequests()
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
      await api.updateCharmBarStatus(id, nextStatus);
    } catch (err) {
      setRequests(previous);
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  };

  const detailRows = (r) =>
    [
      ["Ocasión", r.occasion],
      ["Invitados", r.guests],
      ["Tipo de lugar", r.venueType],
      ["Ciudad y lugar", r.location],
      ["Tipo de experiencia", r.experienceType],
      ["Qué personalizar", r.customize],
      ["Fecha del evento", formatEventDate(r.eventDate)],
      ["Duración", r.duration],
      ["Presupuesto", r.budget],
      ["Más detalles", r.details],
      ["Empresa o marca", r.company],
      ["Cómo nos conoció", r.source],
    ].filter(([, value]) => value);

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 20 }}>
        <h2>Charm Bar Experience</h2>
        <p>{requests.length} solicitudes recibidas</p>
      </div>

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
              <th>Recibida</th>
              <th>Nombre</th>
              <th>Fecha del evento</th>
              <th>Ocasión</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <Fragment key={r.id}>
                <tr>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>{r.fullName}</td>
                  <td>{formatEventDate(r.eventDate)}</td>
                  <td>{r.occasion}</td>
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
                        {detailRows(r).map(([label, value]) => (
                          <Fragment key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                          </Fragment>
                        ))}
                      </dl>

                      <div className="admin-detail-links">
                        <a href={whatsappLink(r.phone)} target="_blank" rel="noreferrer">
                          WhatsApp: {r.phone}
                        </a>
                        <a href={`mailto:${r.email}`}>{r.email}</a>
                      </div>
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