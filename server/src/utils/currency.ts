export const roundPKR = (value: number): number => Math.round(value);

export const formatPKR = (value: number): string =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(roundPKR(value));

