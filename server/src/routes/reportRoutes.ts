import { Router } from 'express';

import { exportCsv, groupReport, monthlyReport } from '../controllers/reportController';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const reportRouter = Router();

reportRouter.use(authenticate);
reportRouter.get('/monthly', asyncHandler(monthlyReport));
reportRouter.get('/group/:groupId', asyncHandler(groupReport));
reportRouter.get('/export/csv', asyncHandler(exportCsv));
