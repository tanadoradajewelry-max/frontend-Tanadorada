import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { CATEGORIES } from "../../data/categories";

const emptyForm = {
  title: "",
  price: "",
  badge: "",
  image: "",
  category: "",
  collection: "",
};

export default function AdminProductForm() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [collections, setCollections] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

    useEffect(() => {
    if (!form.category) {
      setCollections([]);
      return;
    }

    api
      .getCollections(form.category)
      .then((data) => {
        setCollections(data);
        // Si la colección que tenía puesta ya no pertenece a la nueva
        // categoría elegida, la limpiamos.
        setForm((prev) =>
          data.some((c) => c.id === prev.collection)
            ? prev
            : { ...prev, collection: "" }
        );
      })
      .catch(() => setCollections([]));
  }, [form.category]);       

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
          category: product.category || "",
          collection: product.collection || "",
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
        category: form.category || null,
        collection: form.collection || null,
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
          Categoría
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Sin categoría</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>

                <label>
          Colección
          <select
            name="collection"
            value={form.collection}
            onChange={handleChange}
            disabled={!form.category}
          >
            <option value="">
              {form.category ? "Sin colección" : "Primero elige una categoría"}
            </option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
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
