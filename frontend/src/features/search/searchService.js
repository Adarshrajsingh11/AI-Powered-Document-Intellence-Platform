import { apiClient } from '../../services/apiClient';
import { ENDPOINTS } from '../../services/apiEndpoints';

export const searchService = {
  async search({ query, documentIds = [] }) {
    const data = await apiClient.post(ENDPOINTS.search.query, { query, documentIds });
    if (Array.isArray(data)) return data;
    return data?.results ?? [];
  },
};
