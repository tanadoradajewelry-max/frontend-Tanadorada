import { useEffect, useState } from "react";
import { api } from "../api/client";
import {
  cleanMenu,
  defaultMenu,
  readMenuCache,
  writeMenuCache,
  clearMenuCache,
} from "../utils/navMenu";

// Devuelve los enlaces del menú: los guardados en el panel o, si no hay
// ninguno guardado (o falla la conexión), los de siempre.
export function useNavMenu() {
  const [menu, setMenu] = useState(() => readMenuCache() || defaultMenu());

  useEffect(() => {
    let cancelled = false;

    api
      .getContentBlock("nav_menu")
      .then((saved) => {
        if (cancelled) return;

        const cleaned = cleanMenu(saved);

        if (cleaned.length === 0) {
          clearMenuCache();
          setMenu(defaultMenu());
          return;
        }

        writeMenuCache(cleaned);
        setMenu(cleaned);
      })
      .catch(() => {
        /* sin conexión: se queda con lo último que se vio */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return menu;
}