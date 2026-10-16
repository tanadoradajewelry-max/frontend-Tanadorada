import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { quoteBandDefaults } from "../QuoteBand";

const CONTENT_KEY = "quote_band";
const MAX_CHARS = 160;

export default function QuoteBandEditor() {
  const navigate = useNavigate();
  const [data, setData] = useState(quoteBandDefaults);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        setData({ ...quoteBandDefaults, ...(saved || {}) });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateContent(CONTENT_KEY, {
        text: data.text.trim(),
        signature: data.signature.trim(),
      });
      setMessage("Frase guardada ✓");
    } catch (err) {
      if (err.message.includes("Contraseña")) {
        localStorage.removeItem("tanadorada_admin_password");
        navigate("/admin/login");
        return;
      }
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="admin-content-block">
        <h3>Frase de la portada</h3>
        <p className="grid-status">Cargando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-content-block">
        <h3>Frase de la portada</h3>
        <p className="grid-status grid-status--error">
          No se pudo cargar este bloque.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-content-block">
      <h3>Frase de la portada (antes del pie de página)</h3>

      <label>
        Frase
        <textarea
          rows={3}
          maxLength={MAX_CHARS}
          value={data.text}
          onChange={(e) => setData((d) => ({ ...d, text: e.target.value }))}
        />
        <span className="charm-counter">
          {data.text.length} / {MAX_CHARS}
        </span>
      </label>

      <label>
        Firma o detalle pequeño (opcional)
        <input
          type="text"
          maxLength={80}
          value={data.signature}
          onChange={(e) =>
            setData((d) => ({ ...d, signature: e.target.value }))
          }
        />
      </label>

      <p className="admin-currency-hint">
        Si dejas la frase vacía y guardas, esta franja se oculta de la
        portada.
      </p>

      {message && <p className="grid-status">{message}</p>}

      <button
        type="button"
        className="btn btn--dark"
        disabled={isSaving}
        onClick={handleSave}
      >
        {isSaving ? "Guardando…" : "Guardar frase"}
      </button>
    </div>
  );
}