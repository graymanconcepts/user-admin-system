import api from './index';
import { Role } from '../types/Role';

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get('/roles');
  return response.data;
};

export const createRole = async (data: Omit<Role, 'id'>): Promise<Role> => {
  const response = await api.post('/roles', data);
  return response.data;
};

export const updateRole = async (id: number, data: Partial<Role>): Promise<Role> => {
  const response = await api.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/roles/${id}`);
};
