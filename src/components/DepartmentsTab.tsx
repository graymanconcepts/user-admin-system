import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import DepartmentModal from './DepartmentModal';

interface Department {
  id: number;
  name: string;
  description: string;
}

export default function DepartmentsTab() {
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const createDepartmentMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      setIsAddingDepartment(false);
    },
    onError: () => {
      toast.error('Failed to create department');
    }
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Department> }) =>
      updateDepartment(id, data as { name: string; description: string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
      setEditingDepartment(null);
    },
    onError: () => {
      toast.error('Failed to update department');
    }
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete department');
    }
  });

  const handleCreateDepartment = (data: Omit<Department, 'id'>) => {
    createDepartmentMutation.mutate(data);
  };

  const handleUpdateDepartment = (data: Omit<Department, 'id'>) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({
        id: editingDepartment.id,
        data
      });
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (window.confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      deleteDepartmentMutation.mutate(department.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Departments</h2>
        <button
          onClick={() => setIsAddingDepartment(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#65a30d] hover:bg-[#65a30d]/90 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      <table className="table-auto w-full mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2" style={{ width: '200px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id}>
              <td className="px-4 py-2">{department.name}</td>
              <td className="px-4 py-2">{department.description}</td>
              <td className="px-4 py-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingDepartment(department)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department)}
                    className="flex items-center text-sm px-4 py-2 rounded-md bg-status-error hover:bg-status-error/80 text-white transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DepartmentModal
        isOpen={isAddingDepartment}
        onClose={() => setIsAddingDepartment(false)}
        onSubmit={handleCreateDepartment}
        title="Create New Department"
      />

      {editingDepartment && (
        <DepartmentModal
          isOpen={true}
          onClose={() => setEditingDepartment(null)}
          onSubmit={handleUpdateDepartment}
          department={editingDepartment}
          title="Edit Department"
        />
      )}
    </div>
  );
}
