import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error | not-found

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    api
      .getProduct(productId)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("not-found");
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, status };
}
