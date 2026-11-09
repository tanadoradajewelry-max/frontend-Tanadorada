import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import { useCurrency } from "../hooks/useCurrency";
import { getPriceRange } from "../utils/productSizes";
import { isSoldOut } from "../utils/stock";
import { SearchIcon } from "./HeaderIcons";

const MIN_CHARS = 3; // antes 2: menos búsquedas al escribir
const DEBOUNCE_MS = 400; // antes 250: espera más antes de buscar

const EMPTY = { status: "idle", results: [], total: 0 };

export default function SearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { formatPrice } = useCurrency();

  const inputRef = useRef(null);
  // Siempre apunta a la versión más reciente de onClose, así los efectos de
  // abajo no se reinician cada vez que el header se vuelve a dibujar.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [term, setTerm] = useState("");
  const [state, setState] = useState(EMPTY);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = term.trim();
  const canSearch = trimmed.length >= MIN_CHARS;

  // Al abrir: la página de atrás se queda quieta, el cursor va al campo y
  // Escape cierra. Al cerrar, todo vuelve a como estaba.
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  // Busca mientras se escribe, con una pausa corta. Si la persona sigue
  // escribiendo, la búsqueda anterior se cancela para que una respuesta
  // vieja nunca pise a la nueva.
  useEffect(() => {
    if (!canSearch) {
      setState(EMPTY);
      setActiveIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    // Los resultados anteriores se quedan a la vista mientras llegan los nuevos.
    setState((prev) => ({ ...prev, status: "loading" }));

    const timer = setTimeout(() => {
      api
        .searchProducts(trimmed, { signal: controller.signal })
        .then((data) => {
          setState({
            status: "done",
            results: Array.isArray(data?.results) ? data.results : [],
            total: Number(data?.total) || 0,
          });
          setActiveIndex(-1);
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          setState({ status: "error", results: [], total: 0 });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, canSearch]);

  // Con las flechas, el resultado elegido siempre queda a la vista.
  useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(`search-result-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const { status, results, total } = state;

  const openProduct = (id) => {
    onCloseRef.current();
    navigate(`/producto/${id}`);
  };

  const handleInputKeyDown = (event) => {
    const count = results.length;

    if (event.key === "ArrowDown" && count > 0) {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % count);
    } else if (event.key === "ArrowUp" && count > 0) {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      // Solo se abre un resultado cuando ya son los de lo que está escrito.
      const target = results[activeIndex >= 0 ? activeIndex : 0];
      if (target && status === "done") openProduct(target.id);
    }
  };

  const categoryChips = (
    <div className="search-chips">
      {categories.map((category) => (
        <Link
          key={category.slug}
          to={`/coleccion/${category.slug}`}
          className="search-chip"
          onClick={() => onCloseRef.current()}
        >
          {category.label}
        </Link>
      ))}
    </div>
  );

  let statusText = "";
  if (canSearch && status === "done") {
    statusText =
      results.length === 0
        ? ""
        : `${total} ${total === 1 ? "resultado" : "resultados"}`;
  }

  return (
    <div
      className="search-overlay"
      onClick={(event) => {
        // Tocar fuera del panel (en lo oscuro) cierra el buscador.
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en la tienda"
      >
        <div className="search-inner">
          <form
            className="search-form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <SearchIcon />

            <input
              ref={inputRef}
              type="search"
              className="search-input"
              placeholder="Buscar joyas…"
              aria-label="Buscar joyas"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={60}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              onKeyDown={handleInputKeyDown}
            />

            <button
              type="button"
              className="search-close"
              aria-label="Cerrar búsqueda"
              onClick={() => onCloseRef.current()}
            >
              &times;
            </button>
          </form>

          <div className="search-body">
            <p className="search-status" aria-live="polite">
              {statusText}
            </p>

            {!canSearch && (
              <>
                <p className="search-section-label">Explora por categoría</p>
                {categoryChips}
              </>
            )}

            {canSearch && status === "error" && (
              <p className="search-message search-message--error">
                No se pudo buscar. Intenta de nuevo en un momento.
              </p>
            )}

            {canSearch && status === "loading" && results.length === 0 && (
              <p className="search-message">Buscando…</p>
            )}

            {canSearch && status === "done" && results.length === 0 && (
              <>
                <p className="search-message">
                  No encontramos nada para “{trimmed}”.
                </p>
                <p className="search-section-label">Prueba por categoría</p>
                {categoryChips}
              </>
            )}

            {results.length > 0 && (
              <ul
                className={`search-results ${status === "loading" ? "is-loading" : ""}`}
              >
                {results.map((product, index) => {
                  const range = getPriceRange(product);
                  const soldOut = isSoldOut(product);
                  const meta = [product.categoryLabel, product.collectionName]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <li key={product.id}>
                      <Link
                        id={`search-result-${index}`}
                        to={`/producto/${product.id}`}
                        className={`search-result ${index === activeIndex ? "is-active" : ""}`}
                        onClick={() => onCloseRef.current()}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <img
                          src={
                            product.plainImage ||
                            api.productImageUrl(product.id, 0)
                          }
                          alt=""
                          loading="lazy"
                          decoding="async"
                          // Si la foto no carga, queda el cuadro beige y listo.
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />

                        <span className="search-result-info">
                          <span className="search-result-title">
                            {product.title}
                          </span>
                          {meta && (
                            <span className="search-result-meta">{meta}</span>
                          )}
                        </span>

                        <span
                          className={`search-result-price ${soldOut ? "search-result-price--out" : ""}`}
                        >
                          {soldOut ? (
                            "Agotado"
                          ) : (
                            <>
                              {range.hasRange && "Desde "}
                              {formatPrice(range.min)}
                            </>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {total > results.length && (
              <p className="search-more">
                Hay {total} resultados y aquí se muestran los primeros{" "}
                {results.length}. Escribe más palabras para afinar la búsqueda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
