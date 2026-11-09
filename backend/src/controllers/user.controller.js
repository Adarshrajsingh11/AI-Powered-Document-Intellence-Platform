import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { user: await userService.updateProfile(req.user.id, req.body) });
});
