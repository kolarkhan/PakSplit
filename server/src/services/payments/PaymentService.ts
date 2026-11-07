import { PaymentProviderFactory } from './PaymentProviderFactory';

export class PaymentService {
  async createPayment(method: string, payload: Record<string, unknown>) {
    const provider = PaymentProviderFactory.create(method);
    return provider.createPayment(payload as never);
  }

  async verifyPayment(method: string, payload: Record<string, unknown>) {
    const provider = PaymentProviderFactory.create(method);
    return provider.verifyPayment(payload);
  }

  async handleWebhook(method: string, payload: Record<string, unknown>) {
    const provider = PaymentProviderFactory.create(method);
    return provider.handleWebhook(payload);
  }
}
