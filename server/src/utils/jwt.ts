import jwt from 'jsonwebtoken';

import type { JwtUserPayload } from '../interfaces/api';

import { env } from '../config/env';

export const createAccessToken = (payload: JwtUserPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

export const createRefreshToken = (payload: JwtUserPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

export const verifyAccessToken = (token: string): JwtUserPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUserPayload;

export const verifyRefreshToken = (token: string): JwtUserPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUserPayload;

