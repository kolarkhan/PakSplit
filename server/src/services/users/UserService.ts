import { StatusCodes } from 'http-status-codes';

import { UserRepository } from '../../repositories/UserRepository';
import { AppError } from '../../utils/AppError';
import { maskString } from '../../utils/mask';

export class UserService {
  private readonly userRepository = new UserRepository();

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    return this.maskSensitiveDetails(user);
  }

  async updateMe(userId: string, payload: Record<string, unknown>) {
    const user = await this.userRepository.updateProfile(userId, payload);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    return this.maskSensitiveDetails(user);
  }

  async addPaymentMethod(userId: string, payload: Record<string, unknown>) {
    const user = await this.userRepository.addPaymentMethod(userId, payload);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    return this.maskSensitiveDetails(user);
  }

  async updatePaymentMethod(userId: string, paymentMethodId: string, payload: Record<string, unknown>) {
    const user = await this.userRepository.updatePaymentMethod(userId, paymentMethodId, payload);
    if (!user) {
      throw new AppError('Payment method not found', StatusCodes.NOT_FOUND);
    }

    return this.maskSensitiveDetails(user);
  }

  async removePaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.userRepository.removePaymentMethod(userId, paymentMethodId);
    if (!user) {
      throw new AppError('Payment method not found', StatusCodes.NOT_FOUND);
    }

    return this.maskSensitiveDetails(user);
  }

  private maskSensitiveDetails<T extends { paymentMethods?: Array<Record<string, unknown>> }>(user: T) {
    if (!user.paymentMethods) {
      return user;
    }

    return {
      ...user,
      paymentMethods: user.paymentMethods.map((method) => ({
        ...method,
        phoneNumber:
          typeof method.phoneNumber === 'string' ? maskString(method.phoneNumber, 3) : method.phoneNumber,
        accountNumberMasked:
          typeof method.accountNumberMasked === 'string'
            ? maskString(method.accountNumberMasked, 4)
            : method.accountNumberMasked,
        ibanMasked: typeof method.ibanMasked === 'string' ? maskString(method.ibanMasked, 4) : method.ibanMasked,
      })),
    };
  }
}
