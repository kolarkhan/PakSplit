import { BasePaymentProvider, type PaymentCreateInput } from './BasePaymentProvider';

export class EasyPaisaProvider extends BasePaymentProvider {
  readonly name = 'easypaisa';

  async createPayment(input: PaymentCreateInput) {
    return {
      provider: this.name,
      status: 'created' as const,
      deepLink: `easypaisa://pay?amount=${input.amount}&ref=${input.transactionId}`,
      instructions: [
        `Open EasyPaisa and send PKR ${input.amount} to ${input.receiverLabel}.`,
        `Use reference ${input.transactionId} for manual reconciliation.`,
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
      verification: 'TODO: validate EasyPaisa signature',
    };
  }
}
