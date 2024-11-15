import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { to: '/', icon: BarChart, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                  isActive ? 'bg-gray-50 text-blue-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 border-t"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}