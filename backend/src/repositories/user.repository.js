import { User } from '../models/User.js';

export const userRepository = {
  create: (data) => User.create(data),

  findByEmail(email, { withPassword = false } = {}) {
    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+passwordHash') : query;
  },

  findById: (id) => User.findById(id),

  updateById: (id, data) => User.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
};
