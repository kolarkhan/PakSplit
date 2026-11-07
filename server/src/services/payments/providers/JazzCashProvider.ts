import { BasePaymentProvider, type PaymentCreateInput } from './BasePaymentProvider';

export class JazzCashProvider extends BasePaymentProvider {
  readonly name = 'jazzcash';

  async createPayment(input: PaymentCreateInput) {
    return {
      provider: this.name,
      status: 'created' as const,
      deepLink: `jazzcash://pay?amount=${input.amount}&reference=${input.transactionId}`,
      instructions: [
        `Open JazzCash and pay PKR ${input.amount}.`,
        `Keep reference ${input.transactionId} in the transaction note.`,
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
      verification: 'TODO: validate JazzCash signature',
    };
  }
}
