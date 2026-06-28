import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

const authService = new AuthService();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  const { user, tokens } = await authService.register(name, email, password);

  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, accessToken: tokens.accessToken },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);

  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    success: true,
    message: 'Logged in successfully',
    data: { user, accessToken: tokens.accessToken },
  });
});

export const googleLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('Google ID token required', 400);

  const { user, tokens } = await authService.googleLogin(idToken);

  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    success: true,
    message: 'Google login successful',
    data: { user, accessToken: tokens.accessToken },
  });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token not provided', 401);

  const { accessToken } = await authService.refreshAccessToken(token);
  res.json({ success: true, message: 'Token refreshed', data: { accessToken } });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.userId);
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json({ success: true, message: 'User fetched', data: { user } });
});
