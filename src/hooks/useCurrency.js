import { useCurrencyStore } from "../store/useCurrencyStore";
import { HNL_CURRENCY } from "../data/currencyDefaults";

function formatMoney(amountHnl, currency) {
  const value = Number(amountHnl) / currency.hnlPerUnit;
  const text = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${text} ${currency.code}`;
}

export function useCurrency() {
  const currencies = useCurrencyStore((state) => state.currencies);
  const selected = useCurrencyStore((state) => state.selected);

  // Si la moneda elegida ya no existe, se vuelve a lempiras.
  const currency = currencies.find((c) => c.code === selected) || currencies[0];

  return {
    currency,
    currencies,
    isConverted: currency.code !== "HNL",
    // Precio en la moneda que eligió la persona
    formatPrice: (amountHnl) => formatMoney(amountHnl, currency),
    // Precio en lempiras, que es lo que realmente se cobra
    formatHnl: (amountHnl) => formatMoney(amountHnl, HNL_CURRENCY),
  };
}