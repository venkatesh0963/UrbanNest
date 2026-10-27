import bcrypt from 'bcryptjs';
import { UserModel, type IUser } from '../models/User.js';
import { AppError } from '../utils/errors.js';

const SALT_ROUNDS = 10;

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'owner';
  phone?: string | null;
}): Promise<IUser> {
  const normalizedEmail = input.email.toLowerCase().trim();
  const existing = await UserModel.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: input.role === 'owner' ? 'owner' : 'user',
    phone: input.phone || null,
    isActive: true,
    isVerified: false,
  });

  return user;
}

export async function authenticateUser(email: string, password: string): Promise<IUser> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been suspended. Please contact support.',
      403,
      'ACCOUNT_SUSPENDED'
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    phone?: string | null;
    role?: 'user' | 'owner';
  }
): Promise<IUser> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (updates.name !== undefined) {
    user.name = updates.name.trim();
  }
  if (updates.phone !== undefined) {
    user.phone = updates.phone;
  }
  // Allow upgrading a regular 'user' account to 'owner', but never allow self-escalation to 'admin'
  if (updates.role && user.role !== 'admin') {
    user.role = updates.role;
  }

  await user.save();
  return user;
}
