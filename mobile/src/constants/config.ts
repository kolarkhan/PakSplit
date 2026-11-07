export const apiBaseUrl = (() => {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!raw) {
    return 'http://localhost:4000/api/v1';
  }

  const normalized = raw.replace(/\/$/, '');
  return normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`;
})();
