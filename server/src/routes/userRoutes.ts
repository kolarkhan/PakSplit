import { Router } from 'express';

import {
  addPaymentMethod,
  deletePaymentMethod,
  getMe,
  updateCurrency,
  updateLanguage,
  updateMe,
  updatePaymentMethod,
} from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { paymentMethodSchema, updateProfileSchema } from '../validators/userValidators';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get('/me', asyncHandler(getMe));
userRouter.put('/me', validateRequest(updateProfileSchema), asyncHandler(updateMe));
userRouter.put('/me/language', asyncHandler(updateLanguage));
userRouter.put('/me/currency', asyncHandler(updateCurrency));
userRouter.post('/me/payment-methods', validateRequest(paymentMethodSchema), asyncHandler(addPaymentMethod));
userRouter.put('/me/payment-methods/:id', validateRequest(paymentMethodSchema), asyncHandler(updatePaymentMethod));
userRouter.delete('/me/payment-methods/:id', asyncHandler(deletePaymentMethod));
