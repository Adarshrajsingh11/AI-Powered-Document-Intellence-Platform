import { documentService } from '../services/document.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const upload = asyncHandler(async (req, res) => {
  ApiResponse.created(res, { document: await documentService.upload(req.user, req.file) });
});

export const list = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { documents: await documentService.list(req.user) });
});

export const get = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { document: await documentService.get(req.user, req.params.id) });
});

export const remove = asyncHandler(async (req, res) => {
  await documentService.remove(req.user, req.params.id);
  ApiResponse.success(res, { id: req.params.id });
});
