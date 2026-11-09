export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },
  users: {
    me: '/users/me',
  },
  documents: {
    list: '/documents',
    upload: '/documents',
    byId: (id) => `/documents/${id}`,
  },
  search: {
    query: '/search',
  },
  chat: {
    send: '/chat',
  },
};
