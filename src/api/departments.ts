import { api } from './users';

export const fetchDepartments = async () => {
  const { data } = await api.get('/departments');
  return data;
};

export const createDepartment = async (departmentData: { name: string; description: string }) => {
  const { data } = await api.post('/departments', departmentData);
  return data;
};

export const updateDepartment = async (id: number, departmentData: { name: string; description: string }) => {
  const { data } = await api.put(`/departments/${id}`, departmentData);
  return data;
};

export const deleteDepartment = async (id: number) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};
