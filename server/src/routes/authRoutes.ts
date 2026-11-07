import { Router } from 'express';

import { forgotPassword, login, me, refreshToken, register, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/authValidators';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), asyncHandler(register));
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(login));
authRouter.post('/refresh-token', validateRequest(refreshTokenSchema), asyncHandler(refreshToken));
authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), asyncHandler(forgotPassword));
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), asyncHandler(resetPassword));
authRouter.get('/me', authenticate, asyncHandler(me));
