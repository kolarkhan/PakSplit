export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  if ('data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message?: unknown }).message === 'string') {
      return (data as { message: string }).message;
    }
  }

  if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
    return (error as { error: string }).error;
  }

  return fallback;
};
