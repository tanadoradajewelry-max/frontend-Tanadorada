import { useEffect, useState } from "react";
import { api } from "../api/client";

// Contenido de la portada ya descargado en esta visita. Si la persona entra
// a un producto y regresa al inicio, la portada aparece al instante en vez
// de volver a mostrar la pantalla de carga.
let cachedContent = null;

// Trae TODOS los bloques de contenido editable en una sola petición.
// "defaults" solo se usa para los bloques que todavía no hayas guardado
// en el panel.
export function useSiteContent(defaults) {
  const [content, setContent] = useState(() =>
    cachedContent ? { ...defaults, ...cachedContent } : defaults
  );
  const [status, setStatus] = useState(cachedContent ? "success" : "loading");

  useEffect(() => {
    let cancelled = false;

    api
      .getContent()
      .then((data) => {
        if (cancelled) return;
        cachedContent = data;
        setContent({ ...defaults, ...data });
        setStatus("success");
      })
      .catch(() => {
        // Si ya había contenido de esta visita, se queda con ese.
        if (!cancelled && !cachedContent) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { content, status };
}
