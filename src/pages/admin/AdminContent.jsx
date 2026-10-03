import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";

const emptyContent = {
  hero: { image: "", eyebrow: "", headline: "", subtext: "", buttonText: "", buttonHref: "" },
  category_strip: [],
  category_grid: { eyebrow: "", title: "", subtitle: "", items: [] },
  about_us: { image: "", eyebrow: "", title: "", paragraphs: [] },
};

export default function AdminContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState(emptyContent);
  const [status, setStatus] = useState("loading");
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContent()
      .then((data) => {
        setContent((prev) => ({ ...prev, ...data }));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleImageUpload = async (file, onSuccess) => {
    try {
      const uploaded = await api.uploadImage(file);
      onSuccess(uploaded.url);
    } catch (err) {
      alert("No se pudo subir la imagen: " + err.message);
    }
  };

  const saveBlock = async (key, value) => {
    setSavingKey(key);
    setMessage(null);
    try {
      await api.updateContent(key, value);
      setMessage(`"${key}" guardado ✓`);
    } catch (err) {
      if (err.message.includes("Contraseña")) {
        localStorage.removeItem("tanadorada_admin_password");
        navigate("/admin/login");
        return;
      }
      alert(err.message);
    } finally {
      setSavingKey(null);
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
        <h3>Hero (imagen grande de inicio)</h3>

        <label>
          Imagen
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files[0] &&
              handleImageUpload(e.target.files[0], (url) =>
                setContent((c) => ({ ...c, hero: { ...c.hero, image: url } }))
              )
            }
          />
        </label>
        {content.hero.image && (
          <img src={content.hero.image} alt="" className="admin-content-preview" />
        )}

        <label>
          Etiqueta pequeña (eyebrow)
          <input
            type="text"
            value={content.hero.eyebrow}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, eyebrow: e.target.value } }))
            }
          />
        </label>

        <label>
          Título grande
          <input
            type="text"
            value={content.hero.headline}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, headline: e.target.value } }))
            }
          />
        </label>

        <label>
          Subtítulo
          <input
            type="text"
            value={content.hero.subtext}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, subtext: e.target.value } }))
            }
          />
        </label>

        <label>
          Texto del botón
          <input
            type="text"
            value={content.hero.buttonText}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, buttonText: e.target.value } }))
            }
          />
        </label>

        <label>
          A dónde lleva el botón (ej: /coleccion/anillos o #)
          <input
            type="text"
            value={content.hero.buttonHref}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, buttonHref: e.target.value } }))
            }
          />
        </label>

        <button
          type="button"
          className="btn btn--dark"
          disabled={savingKey === "hero"}
          onClick={() => saveBlock("hero", content.hero)}
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
                    setContent((c) => {
                      const items = [...c.category_strip];
                      items[index] = { ...items[index], image: url };
                      return { ...c, category_strip: items };
                    })
                  )
                }
              />
            </label>
            {item.image && <img src={item.image} alt="" className="admin-content-preview" />}

            <label>
              Nombre
              <input
                type="text"
                value={item.label}
                onChange={(e) =>
                  setContent((c) => {
                    const items = [...c.category_strip];
                    items[index] = { ...items[index], label: e.target.value };
                    return { ...c, category_strip: items };
                  })
                }
              />
            </label>

            <label>
              A dónde lleva (ej: /coleccion/anillos)
              <input
                type="text"
                value={item.href}
                onChange={(e) =>
                  setContent((c) => {
                    const items = [...c.category_strip];
                    items[index] = { ...items[index], href: e.target.value };
                    return { ...c, category_strip: items };
                  })
                }
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
              category_strip: [...c.category_strip, { label: "", image: "", href: "" }],
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
        <h3>Colecciones por Estilo (las 3 cajas grandes)</h3>

        <label>
          Etiqueta pequeña
          <input
            type="text"
            value={content.category_grid.eyebrow}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                category_grid: { ...c.category_grid, eyebrow: e.target.value },
              }))
            }
          />
        </label>

        <label>
          Título de la sección
          <input
            type="text"
            value={content.category_grid.title}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                category_grid: { ...c.category_grid, title: e.target.value },
              }))
            }
          />
        </label>

        <label>
          Subtítulo
          <input
            type="text"
            value={content.category_grid.subtitle}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                category_grid: { ...c.category_grid, subtitle: e.target.value },
              }))
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
                    setContent((c) => {
                      const items = [...c.category_grid.items];
                      items[index] = { ...items[index], image: url };
                      return { ...c, category_grid: { ...c.category_grid, items } };
                    })
                  )
                }
              />
            </label>
            {item.image && <img src={item.image} alt="" className="admin-content-preview" />}

            <label>
              Título de la caja
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  setContent((c) => {
                    const items = [...c.category_grid.items];
                    items[index] = { ...items[index], title: e.target.value };
                    return { ...c, category_grid: { ...c.category_grid, items } };
                  })
                }
              />
            </label>

            <label>
              A dónde lleva
              <input
                type="text"
                value={item.href}
                onChange={(e) =>
                  setContent((c) => {
                    const items = [...c.category_grid.items];
                    items[index] = { ...items[index], href: e.target.value };
                    return { ...c, category_grid: { ...c.category_grid, items } };
                  })
                }
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
                items: [...c.category_grid.items, { title: "", image: "", href: "" }],
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
                setContent((c) => ({ ...c, about_us: { ...c.about_us, image: url } }))
              )
            }
          />
        </label>
        {content.about_us.image && (
          <img src={content.about_us.image} alt="" className="admin-content-preview" />
        )}

        <label>
          Etiqueta pequeña
          <input
            type="text"
            value={content.about_us.eyebrow}
            onChange={(e) =>
              setContent((c) => ({ ...c, about_us: { ...c.about_us, eyebrow: e.target.value } }))
            }
          />
        </label>

        <label>
          Título
          <input
            type="text"
            value={content.about_us.title}
            onChange={(e) =>
              setContent((c) => ({ ...c, about_us: { ...c.about_us, title: e.target.value } }))
            }
          />
        </label>

        <label>
          Texto (separa cada párrafo con una línea en blanco)
          <textarea
            rows={10}
            value={content.about_us.paragraphs.join("\n\n")}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                about_us: {
                  ...c.about_us,
                  paragraphs: e.target.value.split(/\n\s*\n/).filter(Boolean),
                },
              }))
            }
          />
        </label>

        <button
          type="button"
          className="btn btn--dark"
          disabled={savingKey === "about_us"}
          onClick={() => saveBlock("about_us", content.about_us)}
        >
          {savingKey === "about_us" ? "Guardando…" : "Guardar Sobre Nosotros"}
        </button>
      </div>
    </section>
  );
}