import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";
import ImageListEditor from "../../components/admin/ImageListEditor";
import { compressImage } from "../../utils/compressImage";
import { navLinks } from "../../data/storeData";

const CONTENT_KEY = "nav_previews";
const MAX_PREVIEW_IMAGES = 4;

// Solo los links de categoría tienen fotos de submenú.
const menuLinks = navLinks.filter((link) => link.href.startsWith("/coleccion/"));

// Punto de partida: las fotos que el menú ya mostraba.
const defaultPreviews = Object.fromEntries(
  menuLinks.map((link) => [link.href, link.preview || []])
);

export default function AdminMenu() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState(defaultPreviews);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        setPreviews((prev) => ({ ...prev, ...(saved || {}) }));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleAuthError = (err) => {
    if (err.message.includes("Contraseña")) {
      localStorage.removeItem("tanadorada_admin_password");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  // Miniaturas: 500px de lado bastan y pesan muy poco.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file, { maxSize: 500, quality: 0.8 });
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  const handleUploadError = (err) => {
    if (handleAuthError(err)) return;
    alert("No se pudo subir la imagen: " + err.message);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateContent(CONTENT_KEY, previews);
      setMessage("Fotos del menú guardadas ✓");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <section className="normal-flow-section">
        <AdminNav />
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="normal-flow-section">
        <AdminNav />
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 30 }}>
        <h2>Fotos del menú</h2>
        <p>Las miniaturas que salen debajo de cada categoría en el menú del celular</p>
      </div>

      {message && <p className="grid-status">{message}</p>}

      <div className="admin-content-block">
        {menuLinks.map((link) => (
          <ImageListEditor
            key={link.href}
            label={`${link.label} (hasta ${MAX_PREVIEW_IMAGES} fotos)`}
            firstLabel="Primera"
            aspectRatio="1 / 1"
            images={previews[link.href] || []}
            max={MAX_PREVIEW_IMAGES}
            onChange={(next) =>
              setPreviews((prev) => ({ ...prev, [link.href]: next }))
            }
            uploadFile={uploadFile}
            onError={handleUploadError}
            onBusyChange={setIsBusy}
          />
        ))}

        <button
          type="button"
          className="btn btn--dark"
          disabled={isSaving || isBusy}
          onClick={handleSave}
        >
          {isSaving ? "Guardando…" : "Guardar fotos del menú"}
        </button>
      </div>
    </section>
  );
}