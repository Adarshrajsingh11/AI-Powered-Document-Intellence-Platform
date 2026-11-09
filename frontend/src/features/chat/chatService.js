import { apiClient } from '../../services/apiClient';
import { ENDPOINTS } from '../../services/apiEndpoints';

export const chatService = {
  // Expected response: { conversationId, message: { role, content, sources: [...] } }
  sendMessage: ({ message, conversationId, documentIds = [] }) =>
    apiClient.post(ENDPOINTS.chat.send, { message, conversationId, documentIds }),
};
