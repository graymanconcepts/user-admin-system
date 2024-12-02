import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { createUser } from '../api/users';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">Create New User</h2>
          <button 
            onClick={onClose}
            className="text-text-disabled hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(data => createMutation.mutate(data))} className="p-6">
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
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input-field w-full"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-status-error">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="input-field w-full"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-status-error">{errors.password.message as string}</p>
              )}
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}