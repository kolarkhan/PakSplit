import { Router } from 'express';

import {
  createExpense,
  deleteExpense,
  getExpense,
  getGroupExpenses,
  getRecentExpenses,
  updateExpense,
  uploadReceipt,
} from '../controllers/expenseController';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { createExpenseSchema } from '../validators/expenseValidators';

export const expenseRouter = Router();

expenseRouter.use(authenticate);
expenseRouter.post('/', validateRequest(createExpenseSchema), asyncHandler(createExpense));
expenseRouter.get('/recent', asyncHandler(getRecentExpenses));
expenseRouter.get('/group/:groupId', asyncHandler(getGroupExpenses));
expenseRouter.get('/:expenseId', asyncHandler(getExpense));
expenseRouter.put('/:expenseId', asyncHandler(updateExpense));
expenseRouter.delete('/:expenseId', asyncHandler(deleteExpense));
expenseRouter.post('/:expenseId/receipt', upload.single('receipt'), asyncHandler(uploadReceipt));
