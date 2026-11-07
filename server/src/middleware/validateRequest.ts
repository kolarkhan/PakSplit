import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';

export const validateRequest =
  (schema: AnyZodObject) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    schema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });
    next();
  };

