import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { fetchUsers, deleteUser } from '../api/users';

// Add User type definition
type User = {
  id: number | string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: string;
  lastLogin?: string;
  organizationalUnit?: string;
  managerEmail?: string;
};

export default function UserList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetchUsers();
      console.log('Successful API endpoint:', '/users');
      console.log('Response:', response);
      return response;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      console.log('Attempting to delete user with ID:', id);
      try {
        const result = await deleteUser(id);
        console.log('Delete result:', result);
        return result;
      } catch (error: any) {
        console.error('Delete error:', error.response?.data || error.message);
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

  const filteredUsers = users.filter((user: User) => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-disabled w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              className="input-field pl-10 pr-4 py-2 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Status</th>
                <th className="table-header">Last Login</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-disabled">Loading...</td>
                </tr>
              ) : filteredUsers.map((user: User) => (
                <tr key={user.id}>
                  <td className="table-cell">{user.name}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      user.status === 'active' 
                        ? 'badge-success' 
                        : 'badge-warning'
                    }`}>
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
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-disabled">
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