import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  ApiResponse.created(res, await authService.register(req.body));
});

export const login = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await authService.login(req.body));
});
