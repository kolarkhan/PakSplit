import { Schema, model, type InferSchemaType } from 'mongoose';

import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE, PAYMENT_METHOD_TYPES } from '../config/constants';

const paymentMethodSchema = new Schema(
  {
    type: {
      type: String,
      enum: PAYMENT_METHOD_TYPES,
      required: true,
    },
    label: { type: String, required: true, trim: true },
    accountTitle: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumberMasked: { type: String, trim: true },
    ibanMasked: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, trim: true },
    preferredCurrency: { type: String, default: DEFAULT_CURRENCY },
    preferredLanguage: { type: String, default: DEFAULT_LANGUAGE },
    paymentMethods: { type: [paymentMethodSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export type PaymentMethodDocument = InferSchemaType<typeof paymentMethodSchema>;

export const UserModel = model('User', userSchema);

