export const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'short' }).format(new Date(value));
