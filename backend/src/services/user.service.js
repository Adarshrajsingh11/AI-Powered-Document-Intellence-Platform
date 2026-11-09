import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  async updateProfile(userId, { name }) {
    const user = await userRepository.updateById(userId, { name });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },
};
