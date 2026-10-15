import { create } from "zustand";
import { api } from "../api/client";
import { DEFAULT_CURRENCIES, HNL_CURRENCY } from "../data/currencyDefaults";

const SELECTED_KEY = "tanadorada_currency";
const CACHE_KEY = "tanadorada_currencies";

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

// Deja solo monedas válidas (código, símbolo y tasa mayor a 0), sin repetidas,
// y se asegura de que los lempiras siempre estén primero.
export function normalizeCurrencies(list) {
  const seen = new Set(["HNL"]);
  const extras = [];

  (Array.isArray(list) ? list : []).forEach((c) => {
    const code = String(c?.code || "").toUpperCase();
    const rate = Number(c?.hnlPerUnit);
    if (!code || seen.has(code) || !c.symbol || !(rate > 0)) return;
    seen.add(code);
    extras.push({
      code,
      label: c.label || code,
      symbol: c.symbol,
      hnlPerUnit: rate,
    });
  });

  return [HNL_CURRENCY, ...extras];
}

function readCachedCurrencies() {
  try {
    const raw = read(CACHE_KEY);
    return raw ? normalizeCurrencies(JSON.parse(raw)) : DEFAULT_CURRENCIES;
  } catch {
    return DEFAULT_CURRENCIES;
  }
}

export const useCurrencyStore = create((set, get) => ({
  // Se arranca con lo último guardado en el navegador para que no parpadee;
  // enseguida se actualiza con lo que hay en el panel.
  currencies: readCachedCurrencies(),
  selected: read(SELECTED_KEY) || "HNL",
  loaded: false,

  loadCurrencies: async () => {
    if (get().loaded) return;
    set({ loaded: true });
    try {
      const saved = await api.getContentBlock("currencies");
      const list = normalizeCurrencies(saved);
      write(CACHE_KEY, JSON.stringify(list));
      set({ currencies: list });
    } catch {
      /* sin conexión: se queda con lo último que se guardó */
    }
  },

  selectCurrency: (code) => {
    write(SELECTED_KEY, code);
    set({ selected: code });
  },
}));