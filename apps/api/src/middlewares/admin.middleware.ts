import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from '../utils/AppError.js';

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};
