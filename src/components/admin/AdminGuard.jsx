import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../api/client";

const PASSWORD_KEY = "tanadorada_admin_password";

// Guardia de TODAS las páginas de admin. Se usa como "ruta de layout" en
// App.jsx: verifica la contraseña con el servidor UNA vez al entrar al
// panel, y mientras navegas entre las pestañas no vuelve a preguntar.
export default function AdminGuard() {
  // checking | ok | denied | error
  const [state, setState] = useState(() =>
    localStorage.getItem(PASSWORD_KEY) ? "checking" : "denied"
  );

  useEffect(() => {
    const password = localStorage.getItem(PASSWORD_KEY);
    if (!password) return undefined;

    let cancelled = false;

    api
      .verifyAdminPassword(password)
      .then((isValid) => {
        if (cancelled) return;
        if (!isValid) localStorage.removeItem(PASSWORD_KEY);
        setState(isValid ? "ok" : "denied");
      })
      .catch(() => {
        // Sin conexión con el servidor: no te sacamos de la sesión,
        // solo avisamos.
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Verificando acceso…</p>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status grid-status--error">
          No se pudo verificar tu acceso: el servidor no responde. Intenta de
          nuevo en un momento.
        </p>
      </section>
    );
  }

  if (state === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
