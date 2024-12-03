export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  departmentId: number;
  role: string;
  roleName: string;
  department: string;
  departmentName: string;
  createdAt: string;
  status: string;
  lastLogin?: string;
  organizationalUnit?: string;
  managerEmail?: string;
  reportsTo?: number | null;
  managerId?: number | null;
}
