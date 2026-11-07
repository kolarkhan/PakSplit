import { Router } from 'express';

import {
  createEasyPaisaPayment,
  createJazzCashPayment,
  easypaisaWebhook,
  jazzcashWebhook,
  verifyPayment,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const paymentRouter = Router();

paymentRouter.post('/webhook/easypaisa', asyncHandler(easypaisaWebhook));
paymentRouter.post('/webhook/jazzcash', asyncHandler(jazzcashWebhook));
paymentRouter.use(authenticate);
paymentRouter.post('/easypaisa/create', asyncHandler(createEasyPaisaPayment));
paymentRouter.post('/jazzcash/create', asyncHandler(createJazzCashPayment));
paymentRouter.post('/verify', asyncHandler(verifyPayment));
