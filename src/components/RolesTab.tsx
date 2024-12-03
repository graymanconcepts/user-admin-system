import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchRoles, createRole, updateRole, deleteRole } from '../api/roles';
import { Role } from '../types/Role';
import RoleModal from './RoleModal';
import ConfirmationModal from './ConfirmationModal';

export default function RolesTab() {
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: roles = [], isError, error, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: Omit<Role, 'id'>) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
      setIsAddingRole(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create role';
      toast.error(message);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Role> }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
      setEditingRole(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update role';
      toast.error(message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete role';
      toast.error(message);
    }
  });

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
      setRoleToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading roles...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-status-error">
        Error loading roles: {(error as Error)?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="p-6 bg-background-primary text-text-primary">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Roles</h2>
        <button
          onClick={() => setIsAddingRole(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#65a30d] hover:bg-[#65a30d]/90 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      <div className="bg-background-secondary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-text-secondary">Name</th>
              <th className="text-left p-4 font-medium text-text-secondary">Description</th>
              <th className="text-right p-4 font-medium text-text-secondary" style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-background-secondary/50">
                <td className="p-4">{role.name}</td>
                <td className="p-4">{role.description}</td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="btn-secondary flex items-center text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(role)}
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
      </div>

      {(isAddingRole || editingRole) && (
        <RoleModal
          isOpen={true}
          onClose={() => {
            setIsAddingRole(false);
            setEditingRole(null);
          }}
          onSubmit={(data) => {
            if (editingRole) {
              updateRoleMutation.mutate({ id: editingRole.id, data });
            } else {
              createRoleMutation.mutate(data);
            }
          }}
          initialData={editingRole}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Role"
          message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
