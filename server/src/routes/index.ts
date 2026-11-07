import { Router } from 'express';

import { authRouter } from './authRoutes';
import { balanceRouter } from './balanceRoutes';
import { expenseRouter } from './expenseRoutes';
import { groupRouter } from './groupRoutes';
import { notificationRouter } from './notificationRoutes';
import { paymentRouter } from './paymentRoutes';
import { reportRouter } from './reportRoutes';
import { settlementRouter } from './settlementRoutes';
import { userRouter } from './userRoutes';

export const apiRouter = Router();

apiRouter.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'PAK SPLIT API v1',
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/groups', groupRouter);
apiRouter.use('/expenses', expenseRouter);
apiRouter.use('/balances', balanceRouter);
apiRouter.use('/settlements', settlementRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/reports', reportRouter);
