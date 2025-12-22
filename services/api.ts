import axios from 'axios';
import { Correspondence, User, AuditLog, Company } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('archivx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

export const correspondence = {
  getAll: async (params?: any) => {
    const response = await api.get<Correspondence[]>('/correspondence', { params });
    return response.data;
  },
  create: async (data: FormData) => {
    const response = await api.post<Correspondence>('/correspondence', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  print: async (id: string) => {
    const response = await api.get(`/correspondence/${id}/print`, { responseType: 'blob' });
    return response.data;
  },
};

export const companies = {
  getAll: async () => {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },
};

export const stats = {
  get: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};

export default api;
