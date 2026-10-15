import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { compressImage } from "../../utils/compressImage";

const CONTENT_KEY = "instagram";
const MAX_ITEMS = 12;

const emptyData = { title: "Síguenos en", handle: "", items: [] };

// Acepta "@usuario", "usuario" o el link completo del perfil.
function cleanHandle(value) {
  return (value || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");
}

export default function InstagramEditor() {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyData);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        setData({ ...emptyData, ...(saved || {}), items: saved?.items || [] });
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

  // Las fotos se ven pequeñas en el carrusel: 800px de lado bastan.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file, { maxSize: 800, quality: 0.8 });
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  const patch = (changes) => setData((d) => ({ ...d, ...changes }));

  const patchItem = (index, changes) =>
    setData((d) => ({
      ...d,
      items: d.items.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    }));

  const handleAdd = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const toUpload = files.slice(0, MAX_ITEMS - data.items.length);
    if (toUpload.length === 0) return;

    setIsUploading(true);
    try {
      const added = [];
      for (const file of toUpload) {
        added.push({ image: await uploadFile(file), link: "" });
      }
      setData((d) => ({ ...d, items: [...d.items, ...added].slice(0, MAX_ITEMS) }));
    } catch (err) {
      handleUploadError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplace = async (index, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      patchItem(index, { image: await uploadFile(file) });
    } catch (err) {
      handleUploadError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const moveItem = (index, direction) =>
    setData((d) => {
      const target = index + direction;
      if (target < 0 || target >= d.items.length) return d;
      const items = [...d.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...d, items };
    });

  const removeItem = (index) =>
    setData((d) => ({ ...d, items: d.items.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    const badLink = data.items.find(
      (item) => item.link && !/^https?:\/\//i.test(item.link.trim())
    );
    if (badLink) {
      alert("Los links de las publicaciones deben empezar con https://");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateContent(CONTENT_KEY, {
        title: data.title,
        handle: cleanHandle(data.handle),
        items: data.items.map((item) => ({
          image: item.image,
          link: (item.link || "").trim(),
        })),
      });
      setMessage("Carrusel de Instagram guardado ✓");
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
        <h3>Carrusel de Instagram</h3>
        <p className="grid-status">Cargando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-content-block">
        <h3>Carrusel de Instagram</h3>
        <p className="grid-status grid-status--error">
          No se pudo cargar este bloque.
        </p>
      </div>
    );
  }

  const handle = cleanHandle(data.handle);

  return (
    <div className="admin-content-block">
      <h3>Carrusel de Instagram</h3>

      <label>
        Título
        <input
          type="text"
          value={data.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>

      <label>
        Tu usuario de Instagram (sin @, o pega el link de tu perfil)
        <input
          type="text"
          value={data.handle}
          onChange={(e) => patch({ handle: e.target.value })}
        />
      </label>
      {handle && (
        <p className="admin-instagram-hint">
          Perfil: https://www.instagram.com/tanadorada?stkn=MWV6M2p6bHdrNXE5ZA%3D%3D
        </p>
      )}

      {data.items.map((item, index) => (
        <div className="admin-content-subitem" key={index}>
          <img src={item.image} alt="" className="admin-content-preview" />

          <label className="admin-gallery-add">
            {isUploading ? "Subiendo…" : "Cambiar foto"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleReplace(index, e)}
              disabled={isUploading}
            />
          </label>

          <label>
            Link de la publicación (opcional; vacío = lleva a tu perfil)
            <input
              type="text"
              value={item.link}
              placeholder="https://www.instagram.com/tanadorada?stkn=MWV6M2p6bHdrNXE5ZA%3D%3D"
              onChange={(e) => patchItem(index, { link: e.target.value })}
            />
          </label>

          <div className="admin-instagram-actions">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveItem(index, -1)}
            >
              ← Mover
            </button>
            <button
              type="button"
              disabled={index === data.items.length - 1}
              onClick={() => moveItem(index, 1)}
            >
              Mover →
            </button>
            <button type="button" onClick={() => removeItem(index)}>
              Quitar
            </button>
          </div>
        </div>
      ))}

      {data.items.length < MAX_ITEMS && (
        <label className="admin-gallery-add">
          {isUploading ? "Subiendo…" : `+ Agregar fotos (hasta ${MAX_ITEMS})`}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleAdd}
            disabled={isUploading}
          />
        </label>
      )}

      {message && <p className="grid-status">{message}</p>}

      <button
        type="button"
        className="btn btn--dark"
        disabled={isSaving || isUploading}
        onClick={handleSave}
      >
        {isSaving ? "Guardando…" : "Guardar carrusel"}
      </button>
    </div>
  );
}
