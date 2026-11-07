import { BasePaymentProvider, type PaymentCreateInput } from './BasePaymentProvider';

export class ManualSettlementProvider extends BasePaymentProvider {
  readonly name = 'manual';

  async createPayment(input: PaymentCreateInput) {
    return {
      provider: this.name,
      status: 'pending' as const,
      instructions: [
        `Settle PKR ${input.amount} offline or in cash with ${input.receiverLabel}.`,
        `Record the transaction ID or note after payment for auditability.`,
      ],
    };
  }

  async verifyPayment() {
    return {
      verified: true,
      status: 'completed' as const,
    };
  }

  async handleWebhook(payload: Record<string, unknown>) {
    return {
      provider: this.name,
      accepted: true,
      payload,
    };
  }
}
