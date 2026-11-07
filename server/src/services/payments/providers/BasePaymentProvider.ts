export interface PaymentCreateInput {
  amount: number;
  currency: string;
  transactionId: string;
  receiverLabel: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentCreateResult {
  provider: string;
  status: 'created' | 'pending';
  deepLink?: string;
  instructions: string[];
  metadata?: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

export abstract class BasePaymentProvider {
  abstract readonly name: string;
  abstract createPayment(input: PaymentCreateInput): Promise<PaymentCreateResult>;
  abstract verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult>;
  abstract handleWebhook(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
}
