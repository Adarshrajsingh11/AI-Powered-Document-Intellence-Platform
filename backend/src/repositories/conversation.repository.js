import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const conversationRepository = {
  create: (data) => Conversation.create(data),
  findByIdForOwner: (id, ownerId) => Conversation.findOne({ _id: id, owner: ownerId }),
  listByOwner: (ownerId) => Conversation.find({ owner: ownerId }).sort({ updatedAt: -1 }).limit(50),
  touch: (id) => Conversation.findByIdAndUpdate(id, { $set: { updatedAt: new Date() } }),

  addMessage: (data) => Message.create(data),
  listMessages: (conversationId) => Message.find({ conversation: conversationId }).sort({ createdAt: 1 }),

  async getRecentMessages(conversationId, limit = 6) {
    const rows = await Message.find({ conversation: conversationId }).sort({ createdAt: -1 }).limit(limit);
    return rows.reverse();
  },
};
