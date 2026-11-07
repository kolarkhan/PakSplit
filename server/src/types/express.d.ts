import type { JwtUserPayload } from '../interfaces/api';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtUserPayload;
    }
  }
}

export {};

