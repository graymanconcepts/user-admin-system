import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

interface Department {
  id?: number;
  name: string;
  description: string;
}

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Department) => void;
  department?: Department;
  title: string;
}

export default function DepartmentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  department,
  title 
}: DepartmentModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Department>({
    defaultValues: department || {
      name: '',
      description: ''
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
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
                Department Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Department name is required' })}
                className="input-field w-full"
                placeholder="Enter department name"
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
                placeholder="Enter department description"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
              >
                {department ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
