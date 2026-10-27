import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors.js';
import {
  registerUser,
  authenticateUser,
  updateUserProfile,
} from '../services/authService.js';
import { env } from '../config/env.js';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  req.session.userId = user._id.toString();
  req.session.role = user.role;

  res.status(201).json({
    user: user.toDTO(),
  });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);
  req.session.userId = user._id.toString();
  req.session.role = user.role;

  res.status(200).json({
    user: user.toDTO(),
  });
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  res.clearCookie(env.SESSION_COOKIE_NAME);
  res.status(200).json({ message: 'Signed out successfully' });
});

export const getCurrentUserHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(200).json({ user: null });
    return;
  }
  res.status(200).json({ user: req.user.toDTO() });
});

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await updateUserProfile(req.user!._id.toString(), req.body);
  req.session.role = updated.role;
  res.status(200).json({ user: updated.toDTO() });
});
