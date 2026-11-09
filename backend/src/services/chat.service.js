import { ai } from '../config/ai.js';
import { conversationRepository as repo } from '../repositories/conversation.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const chatService = {
  async sendMessage(user, { message, conversationId, documentIds = [] }) {
    let conversation;
    if (conversationId) {
      conversation = await repo.findByIdForOwner(conversationId, user.id);
      if (!conversation) throw new ApiError(404, 'Conversation not found');
    } else {
      conversation = await repo.create({ owner: user.id, title: message.slice(0, 60), documentIds });
    }

    const history = (await repo.getRecentMessages(conversation.id, 6)).map((m) => ({ role: m.role, content: m.content }));
    const scope = documentIds.length ? documentIds : conversation.documentIds.map(String);

    const { answer, sources } = await ai.rag.answer({ question: message, history, ownerId: user.id, documentIds: scope });

    await repo.addMessage({ conversation: conversation.id, owner: user.id, role: 'user', content: message });
    const saved = await repo.addMessage({ conversation: conversation.id, owner: user.id, role: 'assistant', content: answer, sources });
    await repo.touch(conversation.id);

    return {
      conversationId: conversation.id,
      message: { id: saved.id, role: 'assistant', content: answer, sources },
    };
  },

  listConversations: (user) => repo.listByOwner(user.id),

  async getConversation(user, id) {
    const conversation = await repo.findByIdForOwner(id, user.id);
    if (!conversation) throw new ApiError(404, 'Conversation not found');
    const messages = await repo.listMessages(conversation.id);
    return { conversation, messages };
  },
};
