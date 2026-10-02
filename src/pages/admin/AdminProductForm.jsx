import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../api/client";

const emptyForm = { title: "", price: "", badge: "", image: "" };

export default function AdminProductForm() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;

    api
      .getProduct(productId)
      .then((product) => {
        setForm({
          title: product.title,
          price: product.price,
          badge: product.badge || "",
          image: product.image,
        });
        setImagePreview(product.image);
        setIsLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el producto");
        setIsLoading(false);
      });
  }, [productId, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      let imageUrl = form.image;

      // Si el usuario eligió un archivo nuevo, se sube primero y se usa
      // esa URL. Si está editando y no tocó la imagen, se queda la anterior.
      if (imageFile) {
        const uploaded = await api.uploadImage(imageFile);
        imageUrl = uploaded.url;
      }

      if (!imageUrl) {
        setError("Debes subir una imagen");
        setIsSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        price: Number(form.price),
        badge: form.badge || null,
        image: imageUrl,
      };

      if (isEditing) {
        await api.updateProduct(productId, payload);
      } else {
        await api.createProduct(payload);
      }

      navigate("/admin");
    } catch (err) {
      if (err.message.includes("Contraseña")) {
        localStorage.removeItem("tanadorada_admin_password");
        navigate("/admin/login");
        return;
      }
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>{isEditing ? "Editar producto" : "Nuevo producto"}</h2>
        <p>Los cambios se reflejan de inmediato en la tienda</p>
      </div>

      <form
        className="checkout-form"
        style={{ maxWidth: 480, margin: "0 auto" }}
        onSubmit={handleSubmit}
      >
        <label>
          Título
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Precio (LPS)
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Badge (opcional: "Nuevo", "Popular"…)
          <input
            type="text"
            name="badge"
            value={form.badge}
            onChange={handleChange}
          />
        </label>

        <label>
          Imagen
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
        </label>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Vista previa"
            style={{
              width: 160,
              height: 160,
              objectFit: "cover",
              borderRadius: "var(--radius-medium)",
            }}
          />
        )}

        {error && <p className="grid-status grid-status--error">{error}</p>}

        <button type="submit" className="btn btn--dark" disabled={isSaving}>
          {isSaving ? "Guardando…" : "Guardar"}
        </button>

        <Link to="/admin" className="product-page-back">
          &larr; Volver al listado
        </Link>
      </form>
    </section>
  );
}
