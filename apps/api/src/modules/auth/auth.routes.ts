import { Router } from 'express';
import { register, login, googleLogin, refreshToken, logout, getMe } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { RegisterSchema, LoginSchema } from '@minara/types';

const router = Router();

/**
 * @route  POST /api/v1/auth/register
 * @desc   Register new user
 * @access Public
 */
router.post('/register', validate(RegisterSchema), register);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Login with email and password
 * @access Public
 */
router.post('/login', validate(LoginSchema), login);

/**
 * @route  POST /api/v1/auth/google
 * @desc   Login / register with Google OAuth
 * @access Public
 */
router.post('/google', googleLogin);

/**
 * @route  POST /api/v1/auth/refresh
 * @desc   Refresh access token using httpOnly cookie
 * @access Public
 */
router.post('/refresh', refreshToken);

/**
 * @route  POST /api/v1/auth/logout
 * @desc   Logout and clear refresh token
 * @access Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route  GET /api/v1/auth/me
 * @desc   Get current user profile
 * @access Private
 */
router.get('/me', authenticate, getMe);

export default router;
