import { Router } from 'express';

import {
  cancelSettlement,
  confirmSettlement,
  createSettlement,
  getGroupSettlements,
  getSettlement,
} from '../controllers/settlementController';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { createSettlementSchema } from '../validators/settlementValidators';

export const settlementRouter = Router();

settlementRouter.use(authenticate);
settlementRouter.post('/', validateRequest(createSettlementSchema), asyncHandler(createSettlement));
settlementRouter.get('/group/:groupId', asyncHandler(getGroupSettlements));
settlementRouter.get('/:settlementId', asyncHandler(getSettlement));
settlementRouter.put('/:settlementId/confirm', asyncHandler(confirmSettlement));
settlementRouter.put('/:settlementId/cancel', asyncHandler(cancelSettlement));
