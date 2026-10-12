import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";
import ImageListEditor from "../../components/admin/ImageListEditor";
import { compressImage } from "../../utils/compressImage";

const MAX_HERO_IMAGES = 5;
const MAX_ABOUT_IMAGES = 5;

const emptyContent = {
  hero: {
    image: "",
    images: [],
    eyebrow: "",
    headline: "",
    subtext: "",
    buttonText: "",
    buttonHref: "",
  },
  category_strip: [],
  category_grid: { eyebrow: "", title: "", subtitle: "", items: [] },
  about_us: { image: "", images: [], eyebrow: "", title: "", paragraphs: [] },
};

// Si el bloque ya tiene lista de imágenes se usa; si es contenido viejo,
// se parte de la imagen única que tenía.
function getSlides(block) {
  if (block.images?.length) return block.images;
  return block.image ? [block.image] : [];
}

export default function AdminContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState(emptyContent);
  const [aboutText, setAboutText] = useState("");
  const [status, setStatus] = useState("loading");
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState(null);
  const [heroBusy, setHeroBusy] = useState(false);
  const [aboutBusy, setAboutBusy] = useState(false);

  useEffect(() => {
    api
      .getContent()
      .then((data) => {
        setContent((prev) => ({ ...prev, ...data }));
        setAboutText((data.about_us?.paragraphs || []).join("\n\n"));
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

  // Comprime y sube una foto; devuelve su URL.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file);
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  // Sube UNA imagen (Franja y cajas de Colecciones).
  const handleImageUpload = async (file, onSuccess) => {
    try {
      onSuccess(await uploadFile(file));
    } catch (err) {
      handleUploadError(err);
    }
  };

  const patchBlock = (key, patch) =>
    setContent((c) => ({ ...c, [key]: { ...c[key], ...patch } }));

  // Cambia la lista de imágenes de un bloque; la primera es siempre "image".
  const setSlides = (key, next) =>
    setContent((c) => ({
      ...c,
      [key]: { ...c[key], images: next, image: next[0] || "" },
    }));

  const patchStripItem = (index, patch) =>
    setContent((c) => {
      const items = [...c.category_strip];
      items[index] = { ...items[index], ...patch };
      return { ...c, category_strip: items };
    });

  const patchGridItem = (index, patch) =>
    setContent((c) => {
      const items = [...c.category_grid.items];
      items[index] = { ...items[index], ...patch };
      return { ...c, category_grid: { ...c.category_grid, items } };
    });

  const saveBlock = async (key, value) => {
    setSavingKey(key);
    setMessage(null);
    try {
      await api.updateContent(key, value);
      setMessage(`"${key}" guardado ✓`);
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const heroSlides = getSlides(content.hero);
  const aboutSlides = getSlides(content.about_us);

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
        <h2>Contenido de la Portada</h2>
        <p>Edita cada bloque y dale Guardar por separado</p>
      </div>

      {message && <p className="grid-status">{message}</p>}

      {/* --- HERO --- */}
      <div className="admin-content-block">
        <h3>Hero (carrusel de inicio)</h3>

        <ImageListEditor
          label={`Imágenes (hasta ${MAX_HERO_IMAGES}) — se mueven solas cada 5 segundos`}
          firstLabel="Primera"
          images={heroSlides}
          max={MAX_HERO_IMAGES}
          onChange={(next) => setSlides("hero", next)}
          uploadFile={uploadFile}
          onError={handleUploadError}
          onBusyChange={setHeroBusy}
        />

        <label>
          Etiqueta pequeña (eyebrow)
          <input
            type="text"
            value={content.hero.eyebrow}
            onChange={(e) => patchBlock("hero", { eyebrow: e.target.value })}
          />
        </label>

        <label>
          Título grande
          <input
            type="text"
            value={content.hero.headline}
            onChange={(e) => patchBlock("hero", { headline: e.target.value })}
          />
        </label>

        <label>
          Subtítulo
          <input
            type="text"
            value={content.hero.subtext}
            onChange={(e) => patchBlock("hero", { subtext: e.target.value })}
          />
        </label>

        <label>
          Texto del botón
          <input
            type="text"
            value={content.hero.buttonText}
            onChange={(e) => patchBlock("hero", { buttonText: e.target.value })}
          />
        </label>

        <label>
          A dónde lleva el botón (ej: #colecciones-por-estilo o /coleccion/anillos)
          <input
            type="text"
            value={content.hero.buttonHref}
            onChange={(e) => patchBlock("hero", { buttonHref: e.target.value })}
          />
        </label>

        <button
          type="button"
          className="btn btn--dark"
          disabled={savingKey === "hero" || heroBusy}
          onClick={() => {
            if (heroSlides.length === 0) {
              alert("El hero necesita al menos una imagen");
              return;
            }
            saveBlock("hero", content.hero);
          }}
        >
          {savingKey === "hero" ? "Guardando…" : "Guardar Hero"}
        </button>
      </div>

      {/* --- CATEGORY STRIP --- */}
      <div className="admin-content-block">
        <h3>Franja de categorías (debajo del hero)</h3>

        {content.category_strip.map((item, index) => (
          <div className="admin-content-subitem" key={index}>
            <label>
              Imagen
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files[0] &&
                  handleImageUpload(e.target.files[0], (url) =>
                    patchStripItem(index, { image: url })
                  )
                }
              />
            </label>
            {item.image && (
              <img src={item.image} alt="" className="admin-content-preview" />
            )}

            <label>
              Nombre
              <input
                type="text"
                value={item.label}
                onChange={(e) => patchStripItem(index, { label: e.target.value })}
              />
            </label>

            <label>
              A dónde lleva (ej: /coleccion/anillos)
              <input
                type="text"
                value={item.href}
                onChange={(e) => patchStripItem(index, { href: e.target.value })}
              />
            </label>

            <button
              type="button"
              className="admin-content-remove"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  category_strip: c.category_strip.filter((_, i) => i !== index),
                }))
              }
            >
              Quitar esta
            </button>
          </div>
        ))}

        <button
          type="button"
          className="product-page-back"
          onClick={() =>
            setContent((c) => ({
              ...c,
              category_strip: [
                ...c.category_strip,
                { label: "", image: "", href: "" },
              ],
            }))
          }
        >
          + Agregar otra
        </button>

        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn--dark"
            disabled={savingKey === "category_strip"}
            onClick={() => saveBlock("category_strip", content.category_strip)}
          >
            {savingKey === "category_strip" ? "Guardando…" : "Guardar Franja"}
          </button>
        </div>
      </div>

      {/* --- CATEGORY GRID --- */}
      <div className="admin-content-block">
        <h3>Colecciones por Estilo (las cajas grandes)</h3>

        <label>
          Etiqueta pequeña
          <input
            type="text"
            value={content.category_grid.eyebrow}
            onChange={(e) =>
              patchBlock("category_grid", { eyebrow: e.target.value })
            }
          />
        </label>

        <label>
          Título de la sección
          <input
            type="text"
            value={content.category_grid.title}
            onChange={(e) =>
              patchBlock("category_grid", { title: e.target.value })
            }
          />
        </label>

        <label>
          Subtítulo
          <input
            type="text"
            value={content.category_grid.subtitle}
            onChange={(e) =>
              patchBlock("category_grid", { subtitle: e.target.value })
            }
          />
        </label>

        {content.category_grid.items.map((item, index) => (
          <div className="admin-content-subitem" key={index}>
            <label>
              Imagen
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files[0] &&
                  handleImageUpload(e.target.files[0], (url) =>
                    patchGridItem(index, { image: url })
                  )
                }
              />
            </label>
            {item.image && (
              <img src={item.image} alt="" className="admin-content-preview" />
            )}

            <label>
              Título de la caja
              <input
                type="text"
                value={item.title}
                onChange={(e) => patchGridItem(index, { title: e.target.value })}
              />
            </label>

            <label>
              A dónde lleva
              <input
                type="text"
                value={item.href}
                onChange={(e) => patchGridItem(index, { href: e.target.value })}
              />
            </label>

            <button
              type="button"
              className="admin-content-remove"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  category_grid: {
                    ...c.category_grid,
                    items: c.category_grid.items.filter((_, i) => i !== index),
                  },
                }))
              }
            >
              Quitar esta
            </button>
          </div>
        ))}

        <button
          type="button"
          className="product-page-back"
          onClick={() =>
            setContent((c) => ({
              ...c,
              category_grid: {
                ...c.category_grid,
                items: [
                  ...c.category_grid.items,
                  { title: "", image: "", href: "" },
                ],
              },
            }))
          }
        >
          + Agregar otra caja
        </button>

        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn--dark"
            disabled={savingKey === "category_grid"}
            onClick={() => saveBlock("category_grid", content.category_grid)}
          >
            {savingKey === "category_grid" ? "Guardando…" : "Guardar Colecciones"}
          </button>
        </div>
      </div>

      {/* --- ABOUT US --- */}
      <div className="admin-content-block">
        <h3>Sobre Nosotros</h3>

        <ImageListEditor
          label={`Imágenes (hasta ${MAX_ABOUT_IMAGES}) — se mueven solas cada 5 segundos`}
          firstLabel="Primera"
          images={aboutSlides}
          max={MAX_ABOUT_IMAGES}
          onChange={(next) => setSlides("about_us", next)}
          uploadFile={uploadFile}
          onError={handleUploadError}
          onBusyChange={setAboutBusy}
        />

        <label>
          Etiqueta pequeña
          <input
            type="text"
            value={content.about_us.eyebrow}
            onChange={(e) => patchBlock("about_us", { eyebrow: e.target.value })}
          />
        </label>

        <label>
          Título
          <input
            type="text"
            value={content.about_us.title}
            onChange={(e) => patchBlock("about_us", { title: e.target.value })}
          />
        </label>

        <label>
          Texto (separa cada párrafo con una línea en blanco)
          <textarea
            rows={10}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn btn--dark"
          disabled={savingKey === "about_us" || aboutBusy}
          onClick={() => {
            if (aboutSlides.length === 0) {
              alert("Sobre Nosotros necesita al menos una imagen");
              return;
            }
            saveBlock("about_us", {
              ...content.about_us,
              images: aboutSlides,
              image: aboutSlides[0],
              paragraphs: aboutText
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean),
            });
          }}
        >
          {savingKey === "about_us" ? "Guardando…" : "Guardar Sobre Nosotros"}
        </button>
      </div>
    </section>
  );
}
