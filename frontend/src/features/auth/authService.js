import { apiClient } from '../../services/apiClient';
import { ENDPOINTS } from '../../services/apiEndpoints';

export const authService = {
  register: (data) => apiClient.post(ENDPOINTS.auth.register, data),
  login: (data) => apiClient.post(ENDPOINTS.auth.login, data),
  getMe: () => apiClient.get(ENDPOINTS.users.me),
};
