import { useEffect, useRef, useState } from "react";

// Reemplaza el bloque:
//   document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el))
// del HTML original. Cada componente que llame a este hook obtiene su propio
// ref + bandera "isVisible", que se vuelve true la primera vez que entra en
// pantalla y luego no se revierte (mismo comportamiento que el original).
export function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
