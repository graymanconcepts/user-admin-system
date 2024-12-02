import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/login', { email, password });
  return data;
};

export const fetchUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const fetchUserDetails = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const createUser = async (userData: any) => {
  const { data } = await api.post('/users', userData);
  return data;
};

export const updateUser = async (id: string, userData: any) => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data;
};

export const resetPassword = async (id: string, newPassword: string) => {
  const { data } = await api.post(`/users/${id}/reset-password`, { newPassword });
  return data;
};

export const fetchAuditLogs = async () => {
  const { data } = await api.get('/audit-logs');
  return data;
};

export const deleteUser = async (id: string | number) => {
  await api.post(`/users/${id}/delete`);
  return { success: true };
};