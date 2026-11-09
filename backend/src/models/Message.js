import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    documentId: String,
    documentName: String,
    page: Number,
    snippet: String,
    score: Number,
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: { type: [sourceSchema], default: [] },
  },
  { timestamps: true },
);

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
