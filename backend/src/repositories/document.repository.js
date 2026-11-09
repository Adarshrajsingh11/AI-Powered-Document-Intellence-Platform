import { Document } from '../models/Document.js';

export const documentRepository = {
  create: (data) => Document.create(data),
  listByOwner: (ownerId) => Document.find({ owner: ownerId }).sort({ createdAt: -1 }),
  // Always scope by owner so one user can never read another user's document
  findByIdForOwner: (id, ownerId) => Document.findOne({ _id: id, owner: ownerId }),
  findById: (id) => Document.findById(id),
  update: (id, data) => Document.findByIdAndUpdate(id, data, { new: true }),
  deleteById: (id) => Document.findByIdAndDelete(id),
  findPending: () => Document.find({ status: { $in: ['uploaded', 'processing'] } }),
  findStuck: (before) => Document.find({ status: 'processing', updatedAt: { $lt: before } }),
};
