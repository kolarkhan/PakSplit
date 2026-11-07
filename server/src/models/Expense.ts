import { Schema, model } from 'mongoose';

import { DEFAULT_CURRENCY, EXPENSE_CATEGORIES, SPLIT_TYPES } from '../config/constants';

const expenseSplitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0 },
    shares: { type: Number, min: 0 },
  },
  { _id: false },
);

const expenseSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 400 },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: 'other' },
    totalAmount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: DEFAULT_CURRENCY },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    splitType: { type: String, enum: SPLIT_TYPES, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    splits: { type: [expenseSplitSchema], default: [] },
    notes: { type: String, trim: true, maxlength: 500 },
    receiptUrl: { type: String, trim: true },
    expenseDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

expenseSchema.index({ groupId: 1, expenseDate: -1 });

export const ExpenseModel = model('Expense', expenseSchema);

