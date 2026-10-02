import { Link } from "react-router-dom";

export default function AccountComingSoon({ title }) {
  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>Muy pronto vas a poder crear tu cuenta y ver tu historial de pedidos</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <Link to="/" className="btn btn--dark">
          Volver a la tienda
        </Link>
      </div>
    </section>
  );
}