import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsChecking(true);

    try {
      const isValid = await api.verifyAdminPassword(password);
      if (!isValid) {
        setError("Contraseña incorrecta");
        setIsChecking(false);
        return;
      }
      localStorage.setItem("tanadorada_admin_password", password);
      navigate("/admin");
    } catch (err) {
      setError("No se pudo conectar con el servidor");
      setIsChecking(false);
    }
  };

  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>Panel Admin</h2>
        <p>Ingresa tu contraseña para administrar productos</p>
      </div>

      <form
        className="checkout-form"
        style={{ maxWidth: 360, margin: "0 auto" }}
        onSubmit={handleSubmit}
      >
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </label>

        {error && <p className="grid-status grid-status--error">{error}</p>}

        <button type="submit" className="btn btn--dark" disabled={isChecking}>
          {isChecking ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}
