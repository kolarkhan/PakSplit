export const storageService = {
  async uploadReceipt(_fileUri: string) {
    return {
      url: 'https://storage.placeholder/mobile-receipt',
      status: 'queued',
    };
  },
};
