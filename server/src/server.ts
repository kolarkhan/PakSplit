import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`PAK SPLIT server listening on port ${env.PORT}`);
  });
};

bootstrap().catch((error: unknown) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});

