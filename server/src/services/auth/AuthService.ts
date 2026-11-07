import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { StatusCodes } from 'http-status-codes';

import type { AuthTokens } from '../../interfaces/api';

import { RefreshTokenRepository } from '../../repositories/RefreshTokenRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { AppError } from '../../utils/AppError';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export class AuthService {
  private readonly userRepository = new UserRepository();
  private readonly refreshTokenRepository = new RefreshTokenRepository();

  async register(payload: { fullName: string; email: string; phone?: string; password: string }) {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError('User already exists', StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.userRepository.create({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      passwordHash,
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { user, tokens };
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    const sanitizedUser = await this.userRepository.findById(user._id.toString());
    const tokens = await this.issueTokens(user._id.toString(), user.email);
    return { user: sanitizedUser, tokens };
  }

  async refresh(refreshToken: string) {
    verifyRefreshToken(refreshToken);

    const tokenRecord = await this.refreshTokenRepository.findValid(refreshToken);
    if (!tokenRecord) {
      throw new AppError('Refresh token expired or invalid', StatusCodes.UNAUTHORIZED);
    }

    const user = await this.userRepository.findById(tokenRecord.userId.toString());
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    await this.refreshTokenRepository.revoke(refreshToken);
    return this.issueTokens(user._id.toString(), user.email);
  }

  async me(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the account exists, a reset link has been prepared.' };
    }

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await this.userRepository.setResetToken(user._id.toString(), tokenHash, new Date(Date.now() + 3600000));

    return {
      message: 'Password reset token generated. Wire this into email/SMS delivery.',
      resetTokenPreview: rawToken,
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepository.findByResetToken(tokenHash);
    if (!user) {
      throw new AppError('Reset token is invalid or expired', StatusCodes.BAD_REQUEST);
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    const tokens = await this.issueTokens(user._id.toString(), user.email);
    return { user: await this.userRepository.findById(user._id.toString()), tokens };
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = createAccessToken({ userId, email });
    const refreshToken = createRefreshToken({ userId, email });
    await this.refreshTokenRepository.create(userId, refreshToken, new Date(Date.now() + 30 * 86400000));

    return { accessToken, refreshToken };
  }
}
