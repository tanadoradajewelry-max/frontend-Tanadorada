export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>TANADORADA</h4>
          <p style={{ fontSize: "11px", opacity: 0.7, lineHeight: 1.8 }}>
            Joyería creada para resaltar la belleza natural de cada mujer.
            Envíos seguros.
          </p>
        </div>
        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li>Novedades</li>
            <li>Collares</li>
            <li>Aretes</li>
            <li>Anillos</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Ayuda</h4>
          <ul>
            <li>Preguntas Frecuentes</li>
            <li>Guía de Tallas</li>
            <li>Cuidado de tus Joyas</li>
            <li>Envíos y Devoluciones</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li>contacto@tanadorada.com</li>
            <li>WhatsApp: +504</li>
            <li>Honduras</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2026 TANADORADA.</div>
    </footer>
  );
}
