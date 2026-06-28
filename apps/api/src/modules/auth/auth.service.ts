import { OAuth2Client } from 'google-auth-library';
import { AuthRepository } from './auth.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';
import { IUser } from '../users/user.model.js';

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

    const user = await this.repo.create({ name, email, password });
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
}
