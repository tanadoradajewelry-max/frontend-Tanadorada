import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, status, error };
}
