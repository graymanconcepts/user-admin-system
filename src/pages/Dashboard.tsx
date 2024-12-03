import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchUsers } from '../api/users';

interface DonutChartProps {
  value: number;
  total: number;
  color: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ value, total, color }) => {
  const data = [
    { value: value },
    { value: total - value }
  ];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={25}
          outerRadius={40}
          paddingAngle={2}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          <Cell fill={color} />
          <Cell fill="#e2e8f0" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

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
      iconColor: 'text-accent',
      chartColor: '#7c3aed'
    },
    { 
      title: 'Active Users', 
      value: stats.active, 
      icon: UserCheck,
      bgColor: 'bg-status-success/20',
      iconColor: 'text-status-success',
      chartColor: '#10b981'
    },
    { 
      title: 'Inactive Users', 
      value: stats.inactive, 
      icon: UserX,
      bgColor: 'bg-status-error/20',
      iconColor: 'text-status-error',
      chartColor: '#ef4444'
    },
    { 
      title: 'Recent Logins', 
      value: stats.recentLogins, 
      icon: Clock,
      bgColor: 'bg-status-info/20',
      iconColor: 'text-status-info',
      chartColor: '#3b82f6'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-lg p-6 flex flex-col items-center`}
          >
            <div className="flex items-center justify-between w-full mb-4">
              <h2 className="text-lg font-medium">{card.title}</h2>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <DonutChart 
              value={card.value} 
              total={stats.total || 1} 
              color={card.chartColor} 
            />
            <div className="mt-4 text-2xl font-semibold">
              {card.value}
            </div>
            <div className="text-sm text-gray-500">
              {((card.value / (stats.total || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}