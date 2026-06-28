import { UserModel, IUser } from '../users/user.model.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select('+password +refreshToken');
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).select('+refreshToken');
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return UserModel.findOne({ googleId });
  }

  async create(data: {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    avatar?: string;
  }): Promise<IUser> {
    return UserModel.create(data);
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: token });
  }

  async findByRefreshToken(token: string): Promise<IUser | null> {
    return UserModel.findOne({ refreshToken: token }).select('+refreshToken');
  }
}
