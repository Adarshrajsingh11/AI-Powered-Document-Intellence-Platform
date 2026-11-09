import mongoose from 'mongoose';

export const DOCUMENT_STATUS = ['uploaded', 'processing', 'ready', 'failed'];

const documentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true, trim: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    status: { type: String, enum: DOCUMENT_STATUS, default: 'uploaded', index: true },
    error: { type: String, default: null },
    chunkCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.storagePath; // never expose server file paths
        delete ret.__v;
        ret.id = ret._id;
        return ret;
      },
    },
  },
);

documentSchema.index({ owner: 1, createdAt: -1 });

export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
