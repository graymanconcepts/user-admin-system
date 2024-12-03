import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { updateUser, fetchUsers } from '../api/users';
import { User } from '../types/User';
import { fetchDepartments } from '../api/departments';
import { Department } from '../types/Department'; // Assuming the Department interface is imported from this file
import api from '../api'; // Assuming the api instance is imported from this file

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      roleId: user.roleId?.toString() || '',
      departmentId: user.departmentId?.toString() || '',
      managerId: user.managerId?.toString() || '',
      status: user.status || 'active'
    }
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments
  });

  // Fetch roles with better error handling
  const { data: roles = [], isLoading: isLoadingRoles, error: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await api.get('/roles');
        return response.data || [];
      } catch (error) {
        throw error;
      }
    }
  });

  // Fetch potential managers (only users with manager or admin role, excluding current user)
  const { data: potentialManagers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (users: User[]) => users.filter(u => 
      u.id !== user.id && // Exclude current user
      (u.roleName?.toLowerCase() === 'manager' || u.roleName?.toLowerCase() === 'admin') // Only managers and admins
    )
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Simply invalidate the queries instead of optimistic updates
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update user');
    }
  });

  const onSubmit = (data: any) => {
    // Convert string IDs to numbers or null
    const formattedData = {
      ...data,
      roleId: data.roleId ? parseInt(data.roleId) : null,
      departmentId: data.departmentId ? parseInt(data.departmentId) : null,
      managerId: data.managerId ? parseInt(data.managerId) : null
    };

    updateUserMutation.mutate({
      id: user.id,
      ...formattedData
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-primary-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">Edit User</h2>
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
            {errors.name && <p className="mt-1 text-sm text-status-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="input-field w-full"
              placeholder="Enter email"
            />
            {errors.email && <p className="mt-1 text-sm text-status-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
            {isLoadingRoles ? (
              <div className="text-sm text-text-disabled">Loading roles...</div>
            ) : rolesError ? (
              <div className="text-sm text-status-error">Error loading roles</div>
            ) : (
              <select
                {...register('roleId', { required: 'Role is required' })}
                className="input-field w-full"
                defaultValue={user.roleId?.toString() || ''}
              >
                <option value="">Select a role</option>
                {Array.isArray(roles) && roles.map((role) => (
                  <option 
                    key={role.id} 
                    value={role.id}
                  >
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            )}
            {errors.roleId && <p className="mt-1 text-sm text-status-error">{errors.roleId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
            <select {...register('departmentId')} className="input-field w-full">
              <option value="">Select Department</option>
              {departments.map((dept: Department) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && <p className="mt-1 text-sm text-status-error">{errors.departmentId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select
              {...register('status')}
              className="input-field w-full"
              defaultValue={user.status || 'active'}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
