import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Mock user for open source access
  req.user = {
    _id: 'mock-id',
    name: 'Open User',
    email: 'open@example.com',
    role: UserRole.ADMIN,
    isActive: true
  } as any;
  next();
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Always authorized for open source access
    next();
  };
};
