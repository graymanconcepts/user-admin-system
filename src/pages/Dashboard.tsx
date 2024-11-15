import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { fetchUsers } from '../api/users';

export default function Dashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const stats = {
    total: users.length,
    active: users.filter(user => user.status === 'active').length,
    inactive: users.filter(user => user.status !== 'active').length,
    recentLogins: users.filter(user => {
      const lastLogin = new Date(user.lastLogin);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastLogin > weekAgo;
    }).length
  };

  const cards = [
    { title: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
    { title: 'Active Users', value: stats.active, icon: UserCheck, color: 'green' },
    { title: 'Inactive Users', value: stats.inactive, icon: UserX, color: 'red' },
    { title: 'Recent Logins', value: stats.recentLogins, icon: Clock, color: 'purple' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${color}-100`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}