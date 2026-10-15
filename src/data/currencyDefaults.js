// Los precios de los productos SIEMPRE se guardan en lempiras (HNL).
// Las demás monedas solo cambian cómo se muestran.
export const HNL_CURRENCY = {
  code: "HNL",
  label: "Honduras",
  symbol: "L",
  hnlPerUnit: 1, // cuántos lempiras vale 1 de esta moneda
};

export const DEFAULT_CURRENCIES = [HNL_CURRENCY];