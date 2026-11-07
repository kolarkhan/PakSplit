import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = (request: Request, _response: Response, next: NextFunction): void => {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    next(new AppError('Unauthorized', StatusCodes.UNAUTHORIZED));
    return;
  }

  request.auth = verifyAccessToken(token);
  next();
};
