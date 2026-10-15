import { useEffect, useRef, useState } from "react";
import { useCurrency } from "../hooks/useCurrency";
import { useCurrencyStore } from "../store/useCurrencyStore";

export default function CurrencySelector() {
  const { currency, currencies } = useCurrency();
  const selectCurrency = useCurrencyStore((state) => state.selectCurrency);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Se cierra al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!open) return undefined;

    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Sin al menos una moneda extra no tiene sentido mostrar el selector.
  if (currencies.length < 2) return null;

  return (
    <div className="currency-selector" ref={ref}>
      <button
        type="button"
        className="currency-selector-button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {currency.code}
        <span className={`currency-selector-caret ${open ? "is-open" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <ul className="currency-selector-list">
          {currencies.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                className={c.code === currency.code ? "is-active" : ""}
                aria-current={c.code === currency.code}
                onClick={() => {
                  selectCurrency(c.code);
                  setOpen(false);
                }}
              >
                {c.label} ({c.code} {c.symbol})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}