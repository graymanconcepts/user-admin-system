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
    { 
      title: 'Total Users', 
      value: stats.total, 
      icon: Users,
      bgColor: 'bg-primary-600/20',
      iconColor: 'text-accent'
    },
    { 
      title: 'Active Users', 
      value: stats.active, 
      icon: UserCheck,
      bgColor: 'bg-status-success/20',
      iconColor: 'text-status-success'
    },
    { 
      title: 'Inactive Users', 
      value: stats.inactive, 
      icon: UserX,
      bgColor: 'bg-status-error/20',
      iconColor: 'text-status-error'
    },
    { 
      title: 'Recent Logins', 
      value: stats.recentLogins, 
      icon: Clock,
      bgColor: 'bg-status-info/20',
      iconColor: 'text-status-info'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ title, value, icon: Icon, bgColor, iconColor }) => (
          <div 
            key={title} 
            className="card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="mt-2 text-3xl font-semibold text-text-primary">{value}</p>
              </div>
              <div className={`p-3 rounded-full ${bgColor}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}