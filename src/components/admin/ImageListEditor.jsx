import { useState } from "react";

// Editor de una lista de imágenes para el panel admin: muestra las fotos,
// deja agregar varias a la vez, quitarlas y poner otra como primera.
// Lo usan el Hero y "Sobre Nosotros".
export default function ImageListEditor({
  images,
  max,
  label,
  firstLabel = "Primera",
  aspectRatio, // opcional, ej: "16 / 9"
  onChange,
  uploadFile,
  onError,
  onBusyChange,
}) {
  const [uploading, setUploading] = useState(false);

  const setBusy = (value) => {
    setUploading(value);
    onBusyChange?.(value);
  };

  const handleAdd = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const toUpload = files.slice(0, max - images.length);
    if (toUpload.length === 0) return;

    setBusy(true);
    try {
      const urls = [];
      for (const file of toUpload) {
        urls.push(await uploadFile(file));
      }
      onChange([...images, ...urls].slice(0, max));
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-gallery">
      <span className="admin-gallery-label">{label}</span>

      <div className="admin-gallery-grid">
        {images.map((src, i) => (
          <div className="admin-gallery-item" key={i}>
            <img src={src} alt={`Imagen ${i + 1}`} />
            {i === 0 && (
              <span className="admin-gallery-main-tag">{firstLabel}</span>
            )}
            <div className="admin-gallery-actions">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange([src, ...images.filter((_, idx) => idx !== i)])
                  }
                >
                  Poner primera
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length < max && (
        <label className="admin-gallery-add">
          {uploading ? "Subiendo…" : "+ Agregar imagen(es)"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleAdd}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
