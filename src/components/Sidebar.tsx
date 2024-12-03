import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart, ClipboardList, LogOut, GitBranch, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { to: '/', icon: BarChart, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/organization', icon: GitBranch, label: 'Organization Chart' },
    { to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary border-r border-primary-300/20">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-text-primary">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-6 py-3 text-text-secondary hover:bg-primary-500/30 hover:text-text-primary transition-colors duration-200 ${
                  isActive ? 'bg-primary-500/40 text-text-primary' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-primary-300/20">
          <Link
            to="/metadata"
            className={`flex items-center px-6 py-3 text-text-secondary hover:bg-primary-500/30 hover:text-text-primary transition-colors duration-200 ${
              location.pathname === '/metadata' ? 'bg-primary-500/40 text-text-primary' : ''
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Metadata
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-3 text-text-secondary hover:bg-primary-500/30 hover:text-text-primary transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}