import { useEffect, useState } from "react";
import { api } from "../api/client";

// Trae TODOS los bloques de contenido editable de la portada en una
// sola petición. mientras carga o si falla, usa los valores por defecto
// que le pases — así la página nunca se ve rota o vacía.
export function useSiteContent(defaults) {
  const [content, setContent] = useState(defaults);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .getContent()
      .then((data) => {
        setContent((prev) => ({ ...prev, ...data }));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  return { content, status };
}