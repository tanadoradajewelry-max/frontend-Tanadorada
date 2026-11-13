import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import ImageListEditor from "./ImageListEditor";
import { compressImage } from "../../utils/compressImage";
import {
  MAX_CHARM_VIDEOS,
  MAX_CHARM_IMAGES,
  normalizeCharmMedia,
  parseInstagramUrl,
  cleanLink,
  isInstagramUrl,
} from "../../utils/charmBarMedia";

const KEY = "charm_bar_media";

function move(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function Controls({ index, total, onMove, onRemove }) {
  return (
    <div className="admin-menu-controls">
      <button type="button" aria-label="Subir" disabled={index === 0} onClick={() => onMove(-1)}>
        ↑
      </button>
      <button type="button" aria-label="Bajar" disabled={index === total - 1} onClick={() => onMove(1)}>
        ↓
      </button>
      <button type="button" className="is-danger" onClick={onRemove}>
        Quitar
      </button>
    </div>
  );
}

export default function CharmBarMediaEditor() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(KEY)
      .then((saved) => {
        const media = normalizeCharmMedia(saved);
        setVideos(media.videos);
        setImages(media.images);
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

  // Fotos livianas: 640px bastan para estas tarjetas.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file, { maxSize: 640, quality: 0.75 });
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  // ---------- Videos ----------
  const patchVideo = (index, changes) =>
    setVideos((cur) => cur.map((v, i) => (i === index ? { ...v, ...changes } : v)));

  const addVideo = () =>
    setVideos((cur) =>
      cur.length >= MAX_CHARM_VIDEOS ? cur : [...cur, { url: "", cover: "" }]
    );

  // ---------- Imágenes ----------
  const patchImage = (index, changes) =>
    setImages((cur) => cur.map((img, i) => (i === index ? { ...img, ...changes } : img)));

  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const toUpload = files.slice(0, MAX_CHARM_IMAGES - images.length);
    if (toUpload.length === 0) return;

    setIsBusy(true);
    try {
      const added = [];
      for (const file of toUpload) {
        added.push({ image: await uploadFile(file), link: "" });
      }
      setImages((cur) => [...cur, ...added].slice(0, MAX_CHARM_IMAGES));
    } catch (err) {
      handleUploadError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleReplaceImage = async (index, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsBusy(true);
    try {
      patchImage(index, { image: await uploadFile(file) });
    } catch (err) {
      handleUploadError(err);
    } finally {
      setIsBusy(false);
    }
  };

  // ---------- Guardar ----------
  const handleSave = async () => {
    setMessage(null);

    const cleanVideos = [];
    for (const [i, video] of videos.entries()) {
      const url = video.url.trim();
      if (!url && !video.cover) continue; // fila vacía: se ignora

      const parsed = parseInstagramUrl(url);
      if (!parsed) {
        alert(`Video ${i + 1}: pega el enlace completo de un reel o publicación de Instagram.`);
        return;
      }
      cleanVideos.push({ url: parsed.pageUrl, cover: video.cover || "" });
    }

    const cleanImages = [];
    for (const [i, item] of images.entries()) {
      const raw = item.link.trim();
      let link = "";

      if (raw) {
        link = cleanLink(raw) || "";
        if (!link) {
          alert(`Imagen ${i + 1}: el enlace no es válido. Debe empezar con https://`);
          return;
        }
      }
      cleanImages.push({ image: item.image, link });
    }

    setIsSaving(true);
    try {
      await api.updateContent(KEY, { videos: cleanVideos, images: cleanImages });
      setVideos(cleanVideos);
      setImages(cleanImages);
      setMessage("Videos e imágenes guardados ✓");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <details className="admin-collapsible">
      <summary>Videos e imágenes de la página (a los lados)</summary>

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">No se pudo cargar este bloque.</p>
      )}

      {status === "success" && (
        <div className="admin-content-block">
          <p className="admin-currency-hint">
            Los videos salen a la izquierda de la página de Charm Bar y las
            imágenes a la derecha. En el celular se ven en tiras que se
            deslizan, entre la información y el formulario.
          </p>

          {/* ---------- VIDEOS ---------- */}
          <h3>Videos (hasta {MAX_CHARM_VIDEOS})</h3>

          {videos.map((video, index) => {
            const parsed = parseInstagramUrl(video.url);

            return (
              <div className="admin-content-subitem" key={index}>
                <div className="admin-order-bar">
                  <span className="admin-order-badge">Video {index + 1}</span>
                  <Controls
                    index={index}
                    total={videos.length}
                    onMove={(delta) => setVideos((cur) => move(cur, index, delta))}
                    onRemove={() => setVideos((cur) => cur.filter((_, i) => i !== index))}
                  />
                </div>

                <label>
                  Enlace del reel de Instagram
                  <input
                    type="text"
                    placeholder="https://www.instagram.com/reel/…"
                    value={video.url}
                    onChange={(e) => patchVideo(index, { url: e.target.value })}
                  />
                </label>

                {video.url.trim() &&
                  (parsed ? (
                    <span className="admin-media-ok">✓ Enlace válido ({parsed.code})</span>
                  ) : (
                    <span className="admin-media-bad">
                      Pega el enlace completo de un reel o publicación de Instagram.
                    </span>
                  ))}

                <ImageListEditor
                  label="Portada (opcional): la foto que se ve antes de tocar play"
                  firstLabel="Portada"
                  aspectRatio="9 / 16"
                  images={video.cover ? [video.cover] : []}
                  max={1}
                  onChange={(next) => patchVideo(index, { cover: next[0] || "" })}
                  uploadFile={uploadFile}
                  onError={handleUploadError}
                  onBusyChange={setIsBusy}
                />
              </div>
            );
          })}

          {videos.length < MAX_CHARM_VIDEOS && (
            <button type="button" className="product-page-back" onClick={addVideo}>
              + Agregar video
            </button>
          )}

          {/* ---------- IMÁGENES ---------- */}
          <h3 style={{ marginTop: 18 }}>Imágenes (hasta {MAX_CHARM_IMAGES})</h3>

          {images.map((item, index) => (
            <div className="admin-content-subitem" key={index}>
              <div className="admin-order-bar">
                <span className="admin-order-badge">Imagen {index + 1}</span>
                <Controls
                  index={index}
                  total={images.length}
                  onMove={(delta) => setImages((cur) => move(cur, index, delta))}
                  onRemove={() => setImages((cur) => cur.filter((_, i) => i !== index))}
                />
              </div>

              <div className="admin-media-item">
                <img className="admin-media-thumb" src={item.image} alt="" />

                <div className="admin-media-fields">
                  <label>
                    Al tocar la imagen, abrir este enlace (opcional)
                    <input
                      type="text"
                      placeholder="https://www.instagram.com/reel/…"
                      value={item.link}
                      onChange={(e) => patchImage(index, { link: e.target.value })}
                    />
                  </label>

                  {item.link.trim() &&
                    (cleanLink(item.link) ? (
                      <span className="admin-media-ok">
                        ✓ {isInstagramUrl(cleanLink(item.link)) ? "Abre en Instagram" : "Enlace válido"}
                      </span>
                    ) : (
                      <span className="admin-media-bad">
                        El enlace no es válido. Debe empezar con https://
                      </span>
                    ))}

                  <label className="admin-gallery-add">
                    Cambiar imagen
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleReplaceImage(index, e)}
                      disabled={isBusy}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          {images.length < MAX_CHARM_IMAGES && (
            <label className="admin-gallery-add">
              {isBusy ? "Subiendo…" : "+ Agregar imágenes"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleAddImages}
                disabled={isBusy}
              />
            </label>
          )}

          {message && <p className="grid-status">{message}</p>}

          <button
            type="button"
            className="btn btn--dark"
            disabled={isSaving || isBusy}
            onClick={handleSave}
          >
            {isSaving ? "Guardando…" : "Guardar videos e imágenes"}
          </button>
        </div>
      )}
    </details>
  );
}