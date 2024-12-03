import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { fetchUsers, deleteUser } from '../api/users';
import { fetchDepartments } from '../api/departments';
import { User } from '../types/User';

export default function UserList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | 'all'>('all');
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetchUsers();
      return response;
    },
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      try {
        const result = await deleteUser(id);
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeletingUser(null);
    },
    onError: () => {
      toast.error('Failed to delete user');
    }
  });

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id);
    }
  };

  const filteredUsers = selectedDepartment === 'all'
    ? users
    : users.filter((user: User) => user.departmentId === selectedDepartment);

  const getRoleColor = (role?: string) => {
    if (!role) return 'gray'; // Default color for undefined roles
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      case 'employee':
        return 'green';
      case 'contractor':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'badge-warning';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-error';
      case 'pending':
        return 'badge-warning';
      case 'suspended':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-primary-300/20">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-disabled w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                className="input-field pl-10 pr-4 py-2 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-64">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="input-field py-2 w-full"
              >
                <option value="all">All Departments</option>
                {departments.map((dept: { id: number; name: string }) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Department</th>
                <th className="table-header">Status</th>
                <th className="table-header">Last Login</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-text-disabled">Loading...</td>
                </tr>
              ) : filteredUsers.filter((user: User) => 
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
              ).map((user: User) => (
                <tr key={user.id}>
                  <td className="table-cell">{user.name}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className={`table-cell font-semibold text-${getRoleColor(user.roleName)}-600`}>
                    {user.roleName}
                  </td>
                  <td className="table-cell">{user.departmentName}</td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'PP') : 'Never'}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="btn-secondary flex items-center text-sm"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="flex items-center text-sm px-4 py-2 rounded-md bg-status-error hover:bg-status-error/80 text-white transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.filter((user: User) => 
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-text-disabled">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateUserModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}

      {editingUser && (
        <EditUserModal 
          isOpen={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)} 
        />
      )}

      {deletingUser && (
        <DeleteConfirmationModal
          isOpen={!!deletingUser}
          userName={deletingUser.name}
          onClose={() => setDeletingUser(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}