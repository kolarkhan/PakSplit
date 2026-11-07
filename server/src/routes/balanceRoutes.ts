import { Router } from 'express';

import { groupBalance, overallBalance, simplifiedGroupBalance } from '../controllers/balanceController';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const balanceRouter = Router();

balanceRouter.use(authenticate);
balanceRouter.get('/overall', asyncHandler(overallBalance));
balanceRouter.get('/group/:groupId', asyncHandler(groupBalance));
balanceRouter.get('/group/:groupId/simplified', asyncHandler(simplifiedGroupBalance));
