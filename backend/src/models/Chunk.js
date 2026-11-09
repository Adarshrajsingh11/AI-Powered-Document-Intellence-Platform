import mongoose from 'mongoose';

// A piece of a document plus its embedding. Used by the Mongo vector store in packages/ai.
const chunkSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    documentName: { type: String, required: true },
    index: { type: Number, required: true },
    page: { type: Number, default: null },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true, select: false },
    embeddingModel: { type: String, required: true },
  },
  { timestamps: true },
);

chunkSchema.index({ owner: 1, embeddingModel: 1 });
chunkSchema.index({ document: 1 });

export const Chunk = mongoose.models.Chunk || mongoose.model('Chunk', chunkSchema);
