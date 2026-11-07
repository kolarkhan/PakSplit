export const maskString = (value: string, keepLast = 4): string => {
  if (!value) {
    return value;
  }

  const lastPart = value.slice(-keepLast);
  return `${'*'.repeat(Math.max(value.length - keepLast, 0))}${lastPart}`;
};

