import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';

import { env } from './config/env';
import { requestLogger } from './config/logger';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';

export const app = express();

app.disable('x-powered-by');
app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_APP_URL,
    credentials: true,
  }),
);
app.use(rateLimiter);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'pak-split-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

