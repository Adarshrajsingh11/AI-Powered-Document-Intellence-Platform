import { searchService } from '../services/search.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const search = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { results: await searchService.search(req.user, req.body) });
});
