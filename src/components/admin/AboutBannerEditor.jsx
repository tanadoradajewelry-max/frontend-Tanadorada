import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import ImageListEditor from "./ImageListEditor";
import PillarIcon, { PILLAR_ICON_OPTIONS } from "../PillarIcon";
import { compressImage } from "../../utils/compressImage";
import { aboutBannerDefaults } from "../../data/aboutBannerDefaults";

const CONTENT_KEY = "about_banner";
const MAX_PILLARS = 4;

export default function AboutBannerEditor() {
  const navigate = useNavigate();
  const [data, setData] = useState(aboutBannerDefaults);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        setData({ ...aboutBannerDefaults, ...(saved || {}) });
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

  const handleUploadError = (err) => {
    if (handleAuthError(err)) return;
    alert("No se pudo subir la imagen: " + err.message);
  };

  // El banner ocupa todo el ancho, así que la foto se guarda en 1920px.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file, { maxSize: 1920, quality: 0.8 });
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  const patch = (changes) => setData((d) => ({ ...d, ...changes }));

  const pillars = data.pillars || [];

  const patchPillar = (index, changes) =>
    setData((d) => ({
      ...d,
      pillars: (d.pillars || []).map((p, i) =>
        i === index ? { ...p, ...changes } : p
      ),
    }));

  const addPillar = () =>
    setData((d) => ({
      ...d,
      pillars: [...(d.pillars || []), { icon: "gem", title: "", text: "" }],
    }));

  const removePillar = (index) =>
    setData((d) => ({
      ...d,
      pillars: (d.pillars || []).filter((_, i) => i !== index),
    }));

  const handleSave = async () => {
    if (!data.image) {
      alert("El banner necesita una imagen");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateContent(CONTENT_KEY, data);
      setMessage("Banner guardado ✓");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="admin-content-block">
        <h3>Sobre Nosotros — banner de inicio</h3>
        <p className="grid-status">Cargando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-content-block">
        <h3>Sobre Nosotros — banner de inicio</h3>
        <p className="grid-status grid-status--error">
          No se pudo cargar este bloque.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-content-block">
      <h3>Sobre Nosotros — banner de inicio</h3>

      <ImageListEditor
        label="Foto del banner (ocupa todo el ancho; mejor horizontal)"
        firstLabel="Banner"
        aspectRatio="21 / 9"
        images={data.image ? [data.image] : []}
        max={1}
        onChange={(next) => patch({ image: next[0] || "" })}
        uploadFile={uploadFile}
        onError={handleUploadError}
        onBusyChange={setIsBusy}
      />

      <label>
        Título
        <input
          type="text"
          value={data.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>

      <label>
        Texto del enlace (déjalo vacío para quitarlo)
        <input
          type="text"
          value={data.linkText}
          onChange={(e) => patch({ linkText: e.target.value })}
        />
      </label>

      <label>
        A dónde lleva el enlace (ej: /sobre-nosotros)
        <input
          type="text"
          value={data.linkHref}
          onChange={(e) => patch({ linkHref: e.target.value })}
        />
      </label>

      {pillars.map((pillar, index) => (
        <div className="admin-content-subitem" key={index}>
          <div className="admin-pillar-row">
            <span className="admin-pillar-icon">
              <PillarIcon name={pillar.icon} />
            </span>
            <select
              value={pillar.icon}
              onChange={(e) => patchPillar(index, { icon: e.target.value })}
            >
              {PILLAR_ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label>
            Título
            <input
              type="text"
              value={pillar.title}
              onChange={(e) => patchPillar(index, { title: e.target.value })}
            />
          </label>

          <label>
            Frase corta
            <input
              type="text"
              value={pillar.text}
              onChange={(e) => patchPillar(index, { text: e.target.value })}
            />
          </label>

          <button
            type="button"
            className="admin-content-remove"
            onClick={() => removePillar(index)}
          >
            Quitar esta
          </button>
        </div>
      ))}

      {pillars.length < MAX_PILLARS && (
        <button type="button" className="product-page-back" onClick={addPillar}>
          + Agregar otra idea
        </button>
      )}

      {message && <p className="grid-status">{message}</p>}

      <button
        type="button"
        className="btn btn--dark"
        disabled={isSaving || isBusy}
        onClick={handleSave}
      >
        {isSaving ? "Guardando…" : "Guardar banner"}
      </button>
    </div>
  );
}