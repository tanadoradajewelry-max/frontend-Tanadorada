import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const CONTENT_KEY = "category_strip_header";

const empty = { eyebrow: "", title: "", subtitle: "" };

export default function StripHeaderEditor() {
  const navigate = useNavigate();
  const [data, setData] = useState(empty);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        setData({
          eyebrow: String(saved?.eyebrow ?? ""),
          title: String(saved?.title ?? ""),
          subtitle: String(saved?.subtitle ?? ""),
        });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const patch = (changes) => setData((d) => ({ ...d, ...changes }));

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateContent(CONTENT_KEY, {
        eyebrow: data.eyebrow.trim(),
        title: data.title.trim(),
        subtitle: data.subtitle.trim(),
      });
      setMessage("Textos de la franja guardados ✓");
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
        <h3>Franja de categorías — encabezado</h3>
        <p className="grid-status">Cargando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-content-block">
        <h3>Franja de categorías — encabezado</h3>
        <p className="grid-status grid-status--error">
          No se pudo cargar este bloque.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-content-block">
      <h3>Franja de categorías — encabezado</h3>

      <p className="admin-currency-hint">
        Los textos que salen arriba de las tarjetas que flotan, debajo del hero.
        Si dejas los tres vacíos y guardas, no se muestra ningún encabezado.
      </p>

      <label>
        Etiqueta pequeña
        <input
          type="text"
          maxLength={40}
          placeholder="Ej: Lo esencial"
          value={data.eyebrow}
          onChange={(e) => patch({ eyebrow: e.target.value })}
        />
      </label>

      <label>
        Título
        <input
          type="text"
          maxLength={80}
          placeholder="Ej: Comienza por aquí"
          value={data.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>

      <label>
        Subtítulo
        <input
          type="text"
          maxLength={140}
          placeholder="Ej: Elige por tipo de joya y encuentra la tuya"
          value={data.subtitle}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </label>

      {message && <p className="grid-status">{message}</p>}

      <button
        type="button"
        className="btn btn--dark"
        disabled={isSaving}
        onClick={handleSave}
      >
        {isSaving ? "Guardando…" : "Guardar encabezado"}
      </button>
    </div>
  );
}