import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { UserModel } from '../modules/users/user.model.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = verifyAccessToken(token);
    const user = await UserModel.findById(decoded.userId).select('_id role isActive');

    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = { userId: decoded.userId, role: decoded.role };
    }
  } catch {
    // Optional auth — silently ignore invalid token
  }
  next();
};
