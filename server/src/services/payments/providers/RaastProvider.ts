import { BasePaymentProvider, type PaymentCreateInput } from './BasePaymentProvider';

export class RaastProvider extends BasePaymentProvider {
  readonly name = 'raast';

  async createPayment(input: PaymentCreateInput) {
    return {
      provider: this.name,
      status: 'created' as const,
      instructions: [
        `Transfer PKR ${input.amount} using Raast to ${input.receiverLabel}.`,
        `Add reference ${input.transactionId} so the app can match the settlement.`,
      ],
      metadata: input.metadata,
    };
  }

  async verifyPayment() {
    return {
      verified: false,
      status: 'pending' as const,
      metadata: { placeholder: true },
    };
  }

  async handleWebhook(payload: Record<string, unknown>) {
    return {
      provider: this.name,
      accepted: true,
      payload,
      verification: 'TODO: integrate Raast callback or bank reconciliation',
    };
  }
}
