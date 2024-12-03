import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Role } from '../types/Role';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Role, 'id'>) => void;
  initialData?: Role | null;
}

export default function RoleModal({ isOpen, onClose, onSubmit, initialData }: RoleModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Omit<Role, 'id'>>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || ''
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">
            {initialData ? 'Edit Role' : 'Add Role'}
          </h2>
          <button 
            onClick={onClose}
            className="text-text-disabled hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Role Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Role name is required' })}
                className="input-field w-full"
                placeholder="Enter role name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                className="input-field w-full h-24 resize-none"
                placeholder="Enter role description"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {initialData ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
