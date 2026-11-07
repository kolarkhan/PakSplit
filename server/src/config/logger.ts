import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from './env';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
});

export const requestLogger = pinoHttp({
  logger,
});
