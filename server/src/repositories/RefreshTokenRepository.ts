import { RefreshTokenModel } from '../models/RefreshToken';

export class RefreshTokenRepository {
  create(userId: string, token: string, expiresAt: Date) {
    return RefreshTokenModel.create({ userId, token, expiresAt });
  }

  findValid(token: string) {
    return RefreshTokenModel.findOne({ token, expiresAt: { $gt: new Date() } }).lean();
  }

  revoke(token: string) {
    return RefreshTokenModel.deleteOne({ token });
  }
}
