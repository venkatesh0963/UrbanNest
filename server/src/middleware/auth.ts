import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@urban-nest/shared';
import { UserModel, type IUser } from '../models/User.js';
import { AppError } from '../utils/errors.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: UserRole;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function attachCurrentUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return next();
    }
    const user = await UserModel.findById(userId);
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.session.userId = undefined;
      req.session.role = undefined;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'));
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
}
