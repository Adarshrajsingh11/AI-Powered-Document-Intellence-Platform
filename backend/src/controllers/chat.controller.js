import { chatService } from '../services/chat.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const send = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await chatService.sendMessage(req.user, req.body));
});

export const listConversations = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { conversations: await chatService.listConversations(req.user) });
});

export const getConversation = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await chatService.getConversation(req.user, req.params.id));
});
