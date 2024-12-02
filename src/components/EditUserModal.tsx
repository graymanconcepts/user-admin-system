import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { updateUser } from '../api/users';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string | number;
    name: string;
    email: string;
    status: string;
    organizationalUnit?: string;
    managerEmail?: string;
  };
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: user
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUser(String(user.id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update user');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">Edit User</h2>
          <button 
            onClick={onClose}
            className="text-text-disabled hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(data => updateMutation.mutate(data))} className="p-6">
          <div className="space-y-4">
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
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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
