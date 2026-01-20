export const formatRate = (value: number) =>
  value.toFixed(3).replace(/^0/, "");

export const formatPercent = (value: number) =>
  `${value.toFixed(1)}%`;