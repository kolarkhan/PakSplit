import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { randomUUID } from 'node:crypto';

import { PaymentService } from '../services/payments/PaymentService';

const paymentService = new PaymentService();

export const createEasyPaisaPayment = async (request: Request, response: Response) => {
  const result = await paymentService.createPayment('easypaisa', {
    ...request.body,
    transactionId: randomUUID(),
  });
  response.status(StatusCodes.CREATED).json({ success: true, message: 'EasyPaisa request created', data: result });
};

export const createJazzCashPayment = async (request: Request, response: Response) => {
  const result = await paymentService.createPayment('jazzcash', {
    ...request.body,
    transactionId: randomUUID(),
  });
  response.status(StatusCodes.CREATED).json({ success: true, message: 'JazzCash request created', data: result });
};

export const verifyPayment = async (request: Request, response: Response) => {
  const result = await paymentService.verifyPayment(request.body.method, request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Payment verification placeholder', data: result });
};

export const easypaisaWebhook = async (request: Request, response: Response) => {
  const result = await paymentService.handleWebhook('easypaisa', request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Webhook accepted', data: result });
};

export const jazzcashWebhook = async (request: Request, response: Response) => {
  const result = await paymentService.handleWebhook('jazzcash', request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Webhook accepted', data: result });
};
