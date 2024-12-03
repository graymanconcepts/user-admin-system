import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { createUser, fetchUsers } from '../api/users';
import { fetchDepartments } from '../api/departments';
import { fetchRoles } from '../api/roles';
import { User } from '../types/User';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });

  // Fetch potential managers (only users with manager or admin role)
  const { data: potentialManagers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (users: User[]) => users.filter(u => 
      u.roleName?.toLowerCase() === 'manager' || u.roleName?.toLowerCase() === 'admin'
    )
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      reset();
      onClose();
    },
    onError: () => {
      toast.error('Failed to create user');
    }
  });

  const onSubmit = (data: any) => {
    createUserMutation.mutate({
      ...data,
      roleId: parseInt(data.roleId),
      departmentId: parseInt(data.departmentId),
      managerId: data.managerId ? parseInt(data.managerId) : null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-primary-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">Create New User</h2>
          <button onClick={onClose} className="text-text-disabled hover:text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input-field w-full"
              placeholder="Enter name"
            />
            {errors.name && <p className="mt-1 text-sm text-status-error">{String(errors.name.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="input-field w-full"
              placeholder="Enter email"
            />
            {errors.email && <p className="mt-1 text-sm text-status-error">{String(errors.email.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              className="input-field w-full"
              placeholder="Enter password"
            />
            {errors.password && <p className="mt-1 text-sm text-status-error">{String(errors.password.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
            <select {...register('roleId', { required: 'Role is required' })} className="input-field w-full">
              <option value="">Select Role</option>
              {roles.map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId && <p className="mt-1 text-sm text-status-error">{String(errors.roleId.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
            <select {...register('departmentId', { required: 'Department is required' })} className="input-field w-full">
              <option value="">Select Department</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && <p className="mt-1 text-sm text-status-error">{String(errors.departmentId.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Manager</label>
            <select {...register('managerId')} className="input-field w-full">
              <option value="">No Manager</option>
              {potentialManagers.map((manager: User) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.roleName} - {manager.departmentName})
                </option>
              ))}
            </select>
            {errors.managerId && <p className="mt-1 text-sm text-status-error">{String(errors.managerId.message)}</p>}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}