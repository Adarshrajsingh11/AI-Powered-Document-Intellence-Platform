import { apiClient } from '../../services/apiClient';
import { ENDPOINTS } from '../../services/apiEndpoints';

export const settingsService = {
  updateProfile: (data) => apiClient.patch(ENDPOINTS.users.me, data),
};
