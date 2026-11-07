import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ExpenseService } from '../services/expenses/ExpenseService';
import { FileStorageService } from '../services/storage/FileStorageService';

const expenseService = new ExpenseService();
const fileStorageService = new FileStorageService();

export const createExpense = async (request: Request, response: Response) => {
  const expense = await expenseService.createExpense(request.auth!.userId, request.body);
  response.status(StatusCodes.CREATED).json({ success: true, message: 'Expense added', data: expense });
};

export const getRecentExpenses = async (request: Request, response: Response) => {
  const expenses = await expenseService.getRecentExpensesForUser(request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Recent expenses fetched', data: expenses });
};

export const getGroupExpenses = async (request: Request, response: Response) => {
  const expenses = await expenseService.getGroupExpenses(request.params.groupId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Expenses fetched', data: expenses });
};

export const getExpense = async (request: Request, response: Response) => {
  const expense = await expenseService.getExpense(request.params.expenseId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Expense fetched', data: expense });
};

export const updateExpense = async (request: Request, response: Response) => {
  const expense = await expenseService.updateExpense(request.params.expenseId, request.auth!.userId, request.body);
  response.status(StatusCodes.OK).json({ success: true, message: 'Expense updated', data: expense });
};

export const deleteExpense = async (request: Request, response: Response) => {
  const result = await expenseService.deleteExpense(request.params.expenseId, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Expense deleted', data: result });
};

export const uploadReceipt = async (request: Request, response: Response) => {
  const file = request.file;
  if (!file) {
    response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Receipt image is required' });
    return;
  }

  const upload = await fileStorageService.uploadImage(file);
  const expense = await expenseService.attachReceipt(request.params.expenseId, upload.url, request.auth!.userId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Receipt uploaded', data: expense });
};

