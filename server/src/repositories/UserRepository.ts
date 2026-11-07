import { Types } from 'mongoose';

import { UserModel } from '../models/User';

export class UserRepository {
  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').lean();
  }

  findById(userId: string) {
    return UserModel.findById(userId).lean();
  }

  create(payload: Record<string, unknown>) {
    return UserModel.create(payload);
  }

  updateProfile(userId: string, payload: Record<string, unknown>) {
    return UserModel.findByIdAndUpdate(userId, payload, { new: true }).lean();
  }

  addPaymentMethod(userId: string, payload: Record<string, unknown>) {
    return UserModel.findByIdAndUpdate(userId, { $push: { paymentMethods: payload } }, { new: true }).lean();
  }

  updatePaymentMethod(userId: string, paymentMethodId: string, payload: Record<string, unknown>) {
    return UserModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId), 'paymentMethods._id': new Types.ObjectId(paymentMethodId) },
      {
        $set: Object.fromEntries(
          Object.entries(payload).map(([key, value]) => [`paymentMethods.$.${key}`, value]),
        ),
      },
      { new: true },
    ).lean();
  }

  removePaymentMethod(userId: string, paymentMethodId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $pull: { paymentMethods: { _id: paymentMethodId } } },
      { new: true },
    ).lean();
  }

  setResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });
  }

  findByResetToken(tokenHash: string) {
    return UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');
  }
}
