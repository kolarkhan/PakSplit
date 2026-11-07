import { Schema, model } from 'mongoose';

import { DEFAULT_CURRENCY, PAYMENT_METHOD_TYPES } from '../config/constants';

const settlementSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    payerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: DEFAULT_CURRENCY },
    method: { type: String, enum: PAYMENT_METHOD_TYPES, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    note: { type: String, trim: true, maxlength: 400 },
    transactionReference: { type: String, trim: true, maxlength: 120 },
    accountTitle: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    attachmentUrl: { type: String, trim: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disputeStatus: {
      type: String,
      enum: ['none', 'raised', 'resolved'],
      default: 'none',
    },
  },
  { timestamps: true },
);

settlementSchema.index({ groupId: 1, createdAt: -1 });

export const SettlementModel = model('Settlement', settlementSchema);
