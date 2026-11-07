import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { demoDashboard } from '../../constants/demoData';

export interface DemoExpenseItem {
  id: string;
  groupId: string;
  title: string;
  category: string;
  totalAmount: number;
  expenseDate: string;
  paidBy: string;
  splitType: string;
  notes?: string;
}

interface ExpensesState {
  items: DemoExpenseItem[];
}

const initialState: ExpensesState = {
  items: [
    {
      id: 'expense-demo-1',
      groupId: 'group-demo-1',
      title: demoDashboard.expenses[0]?.title ?? 'Dinner at Monal',
      category: demoDashboard.expenses[0]?.category ?? 'Food',
      totalAmount: demoDashboard.expenses[0]?.totalAmount ?? 4000,
      expenseDate: demoDashboard.expenses[0]?.expenseDate ?? new Date().toISOString(),
      paidBy: 'Ali',
      splitType: 'Equal',
      notes: 'Demo starter expense',
    },
    {
      id: 'expense-demo-2',
      groupId: 'group-demo-1',
      title: demoDashboard.expenses[1]?.title ?? 'Internet Bill',
      category: demoDashboard.expenses[1]?.category ?? 'Utility Bills',
      totalAmount: demoDashboard.expenses[1]?.totalAmount ?? 3200,
      expenseDate: demoDashboard.expenses[1]?.expenseDate ?? new Date().toISOString(),
      paidBy: 'Ahmed',
      splitType: 'Equal',
      notes: 'Demo starter expense',
    },
  ],
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: {
      reducer: (state, action: PayloadAction<DemoExpenseItem>) => {
        state.items.unshift(action.payload);
      },
      prepare: (payload: {
        groupId: string;
        title: string;
        category: string;
        totalAmount: number;
        paidBy: string;
        splitType: string;
        notes?: string;
      }) => ({
        payload: {
          id: `expense-${Date.now()}`,
          groupId: payload.groupId,
          title: payload.title.trim(),
          category: payload.category,
          totalAmount: payload.totalAmount,
          expenseDate: new Date().toISOString(),
          paidBy: payload.paidBy,
          splitType: payload.splitType,
          notes: payload.notes?.trim(),
        },
      }),
    },
  },
});

export const { addExpense } = expensesSlice.actions;
export const expensesReducer = expensesSlice.reducer;
