import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: user.id, expiresIn: env.JWT_EXPIRES_IN });
}

export const authService = {
  async register({ name, email, password }) {
    if (await userRepository.findByEmail(email)) throw new ApiError(409, 'An account with this email already exists');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ name, email, passwordHash });
    return { user, token: signToken(user) };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, { withPassword: true });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) throw new ApiError(401, 'Invalid email or password');
    return { user, token: signToken(user) };
  },
};
