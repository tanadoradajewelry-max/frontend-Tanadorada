import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCurrency } from "../hooks/useCurrency";
import { getPriceRange } from "../utils/productSizes";
import { isSoldOut } from "../utils/stock";

// Solo en computadoras con mouse hay "pasar el mouse por encima". En el
// celular no se descarga la segunda foto, para no gastar datos en algo que
// nunca se vería.
const CAN_HOVER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// "priority" es opcional: si la página se lo pone a las primeras tarjetas,
// esas fotos cargan de inmediato; las demás cargan al acercarse a la pantalla.
export default function ProductCard({ product, priority = false }) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // La segunda foto NO se pide al cargar la página: solo la primera vez que
  // el mouse entra en la tarjeta.
  const [hoverRequested, setHoverRequested] = useState(false);

  const range = getPriceRange(product);
  const soldOut = isSoldOut(product);

  // Segunda foto solo si el producto la tiene y no está agotado.
  const hasHoverPhoto = CAN_HOVER && !soldOut && Number(product.imageCount) > 1;

  return (
    <div
      className={[
        "product-card-item",
        soldOut ? "product-card-item--sold-out" : "",
        hasHoverPhoto ? "product-card-item--has-hover" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => navigate(`/producto/${product.id}`)}
      onMouseEnter={
        hasHoverPhoto && !hoverRequested
          ? () => setHoverRequested(true)
          : undefined
      }
    >
      <div className="product-card-image">
        {soldOut ? (
          <span className="badge-tag badge-tag--sold-out">Agotado</span>
        ) : (
          product.badge && <span className="badge-tag">{product.badge}</span>
        )}

        <img
          className="product-card-photo"
          src={product.image}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />

        {hasHoverPhoto && hoverRequested && (
          <img
            className="product-card-photo product-card-photo--hover"
            src={api.productImageUrl(product.id, 1)}
            alt=""
            aria-hidden="true"
            decoding="async"
            // Si la segunda foto no carga, se esconde y no pasa nada.
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      <div className="product-info-title">{product.title}</div>
      <div className="product-info-price">
        {range.hasRange && "Desde "}
        {formatPrice(range.min)}
      </div>
    </div>
  );
}
