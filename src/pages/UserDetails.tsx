import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { fetchUserDetails, updateUser, resetPassword } from '../api/users';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserDetails(id!)
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: user
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUser(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) => resetPassword(id!, newPassword),
    onSuccess: () => {
      setIsResettingPassword(false);
      toast.success('Password reset successfully');
    },
    onError: () => {
      toast.error('Failed to reset password');
    }
  });

  if (isLoading) {
    return <div className="text-text-secondary">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit User</h1>
        <button
          onClick={() => navigate('/users')}
          className="btn-secondary inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(data => updateMutation.mutate(data))}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input-field w-full"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-status-error">{errors.name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                disabled
                className="input-field w-full bg-primary-600/20 text-text-disabled"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
              <select
                {...register('status')}
                className="input-field w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Organizational Unit
              </label>
              <input
                type="text"
                {...register('organizationalUnit')}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Manager's Email
              </label>
              <input
                type="email"
                {...register('managerEmail')}
                className="input-field w-full"
              />
            </div>

            {isResettingPassword ? (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  New Password
                </label>
                <div className="flex space-x-3">
                  <input
                    type="password"
                    {...register('newPassword', { required: 'New password is required' })}
                    className="input-field w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-status-error">
                    {errors.newPassword.message as string}
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsResettingPassword(true)}
                className="btn-secondary"
              >
                Reset Password
              </button>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}