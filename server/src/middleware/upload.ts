import multer from 'multer';

import { AppError } from '../utils/AppError';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new AppError('Only image uploads are allowed', 400));
      return;
    }

    callback(null, true);
  },
});
