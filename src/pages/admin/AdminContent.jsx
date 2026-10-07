import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";
import { compressImage } from "../../utils/compressImage";

const MAX_HERO_IMAGES = 5;

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
  about_us: { image: "", eyebrow: "", title: "", paragraphs: [] },
};

// Si el hero ya tiene lista de imágenes se usa; si es contenido viejo,
// se parte de la imagen única que tenía.
function getHeroSlides(hero) {
  if (hero.images?.length) return hero.images;
  return hero.image ? [hero.image] : [];
}

export default function AdminContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState(emptyContent);
  const [aboutText, setAboutText] = useState("");
  const [status, setStatus] = useState("loading");
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState(null);
  const [heroUploading, setHeroUploading] = useState(false);

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

  // Comprime y sube una foto; devuelve su URL.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file);
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  // Sube UNA imagen (Franja, cajas, Sobre Nosotros).
  const handleImageUpload = async (file, onSuccess) => {
    try {
      onSuccess(await uploadFile(file));
    } catch (err) {
      if (handleAuthError(err)) return;
      alert("No se pudo subir la imagen: " + err.message);
    }
  };

  const patchBlock = (key, patch) =>
    setContent((c) => ({ ...c, [key]: { ...c[key], ...patch } }));

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

  // Cambia la lista de imágenes del hero; la primera es siempre "image".
  const setHeroSlides = (updater) =>
    setContent((c) => {
      const next = updater(getHeroSlides(c.hero)).slice(0, MAX_HERO_IMAGES);
      return { ...c, hero: { ...c.hero, images: next, image: next[0] || "" } };
    });

  const handleHeroAdd = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const room = MAX_HERO_IMAGES - getHeroSlides(content.hero).length;
    const toUpload = files.slice(0, room);
    if (toUpload.length === 0) return;

    setHeroUploading(true);
    try {
      const urls = [];
      for (const file of toUpload) {
        urls.push(await uploadFile(file));
      }
      setHeroSlides((current) => [...current, ...urls]);
    } catch (err) {
      if (handleAuthError(err)) return;
      alert("No se pudo subir la imagen: " + err.message);
    } finally {
      setHeroUploading(false);
    }
  };

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

  const heroSlides = getHeroSlides(content.hero);

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

        <div className="admin-gallery">
          <span className="admin-gallery-label">
            Imágenes (hasta {MAX_HERO_IMAGES}) — se mueven solas cada 5 segundos
          </span>

          <div className="admin-gallery-grid">
            {heroSlides.map((src, i) => (
              <div className="admin-gallery-item" key={i}>
                <img src={src} alt={`Imagen ${i + 1}`} />
                {i === 0 && (
                  <span className="admin-gallery-main-tag">Primera</span>
                )}
                <div className="admin-gallery-actions">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setHeroSlides((cur) => [
                          cur[i],
                          ...cur.filter((_, idx) => idx !== i),
                        ])
                      }
                    >
                      Poner primera
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setHeroSlides((cur) => cur.filter((_, idx) => idx !== i))
                    }
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {heroSlides.length < MAX_HERO_IMAGES && (
            <label className="admin-gallery-add">
              {heroUploading ? "Subiendo…" : "+ Agregar imagen(es)"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleHeroAdd}
                disabled={heroUploading}
              />
            </label>
          )}
        </div>

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
          disabled={savingKey === "hero" || heroUploading}
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

        <label>
          Imagen
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files[0] &&
              handleImageUpload(e.target.files[0], (url) =>
                patchBlock("about_us", { image: url })
              )
            }
          />
        </label>
        {content.about_us.image && (
          <img
            src={content.about_us.image}
            alt=""
            className="admin-content-preview"
          />
        )}

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
          disabled={savingKey === "about_us"}
          onClick={() =>
            saveBlock("about_us", {
              ...content.about_us,
              paragraphs: aboutText
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean),
            })
          }
        >
          {savingKey === "about_us" ? "Guardando…" : "Guardar Sobre Nosotros"}
        </button>
      </div>
    </section>
  );
}
