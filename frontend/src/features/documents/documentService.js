import { apiClient } from '../../services/apiClient';
import { ENDPOINTS } from '../../services/apiEndpoints';

export const docId = (doc) => doc?._id ?? doc?.id;
export const docName = (doc) => doc?.originalName ?? doc?.name ?? doc?.title ?? 'Untitled';

export const documentService = {
  async list() {
    const data = await apiClient.get(ENDPOINTS.documents.list);
    if (Array.isArray(data)) return data;
    return data?.documents ?? data?.items ?? [];
  },
  async get(id) {
    const data = await apiClient.get(ENDPOINTS.documents.byId(id));
    return data?.document ?? data;
  },
  async upload(file) {
    const form = new FormData();
    form.append('file', file);
    const data = await apiClient.upload(ENDPOINTS.documents.upload, form);
    return data?.document ?? data;
  },
  remove: (id) => apiClient.delete(ENDPOINTS.documents.byId(id)),
};
