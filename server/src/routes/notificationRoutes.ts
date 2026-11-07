import { Router } from 'express';

import { getNotifications, markNotificationRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get('/', asyncHandler(getNotifications));
notificationRouter.put('/:id/read', asyncHandler(markNotificationRead));
