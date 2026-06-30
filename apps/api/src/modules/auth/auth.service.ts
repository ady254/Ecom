import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { AuthRepository } from './auth.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';
import { IUser, UserModel } from '../users/user.model.js';
import { sendMail, passwordResetTemplate, emailVerificationTemplate } from '../../config/email.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

export class AuthService {
  private repo: AuthRepository;

  constructor() {
    this.repo = new AuthRepository();
  }

  private generateTokens(userId: string, role: string): AuthTokens {
    const payload = { userId, role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await this.repo.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await this.repo.create({ name, email, password });

    // Store verification token (fire-and-forget on email)
    await UserModel.findByIdAndUpdate(user._id, {
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
    });

    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}&id=${user._id}`;
    sendMail({
      to: email,
      subject: 'Verify your MINARA email address',
      html: emailVerificationTemplate({ name, verifyUrl }),
    }).catch(() => {});

    const tokens = this.generateTokens(String(user._id), user.role);
    await this.repo.updateRefreshToken(String(user._id), tokens.refreshToken);

    return { user, tokens };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.repo.findByEmail(email);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403);
    }

    const tokens = this.generateTokens(String(user._id), user.role);
    await this.repo.updateRefreshToken(String(user._id), tokens.refreshToken);

    return { user, tokens };
  }

  async googleLogin(idToken: string): Promise<AuthResult> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError('Google OAuth not configured', 503);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token', 401);
    }

    let user = await this.repo.findByGoogleId(payload.sub);

    if (!user) {
      // Try linking by email
      user = await this.repo.findByEmail(payload.email);
      if (user) {
        // Link Google to existing account — update googleId
        await user.updateOne({ googleId: payload.sub, avatar: payload.picture });
        user.googleId = payload.sub;
      } else {
        // Create new user
        user = await this.repo.create({
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          googleId: payload.sub,
          avatar: payload.picture,
        });
      }
    }

    const tokens = this.generateTokens(String(user._id), user.role);
    await this.repo.updateRefreshToken(String(user._id), tokens.refreshToken);

    return { user, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await this.repo.findByRefreshToken(refreshToken);
    if (!user) {
      throw new AppError('Refresh token not found', 401);
    }

    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.repo.updateRefreshToken(userId, null);
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await this.repo.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repo.findByEmail(email);
    // Always return success to avoid user enumeration
    if (!user || !user.isActive) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserModel.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}&id=${user._id}`;
    await sendMail({
      to: email,
      subject: 'MINARA — Reset your password',
      html: passwordResetTemplate({ name: user.name, resetUrl }),
    });
  }

  async resetPassword(userId: string, token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      _id: userId,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) throw new AppError('Invalid or expired reset link', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Invalidate all sessions
    await this.repo.updateRefreshToken(String(user._id), null);
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      _id: userId,
      emailVerificationToken: hashedToken,
    }).select('+emailVerificationToken');

    if (!user) throw new AppError('Invalid or expired verification link', 400);
    if (user.emailVerified) return; // Already verified — idempotent

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.emailVerified) throw new AppError('Email already verified', 400);

    const rawToken = crypto.randomBytes(32).toString('hex');
    await UserModel.findByIdAndUpdate(userId, {
      emailVerificationToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
    });

    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}&id=${userId}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your MINARA email address',
      html: emailVerificationTemplate({ name: user.name, verifyUrl }),
    });
  }
}
