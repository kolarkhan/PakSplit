import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  logger.error({ error }, 'Unhandled application error');

  if (error instanceof ZodError) {
    response.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: error.flatten(),
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
    return;
  }

  response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Something went wrong',
  });
};

