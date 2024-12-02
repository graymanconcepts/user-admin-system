import { Link, useLocation } from 'react-router-dom';
import { LogOut, Users, BarChart2, Clock } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-primary border-b border-primary-300/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-text-primary text-lg font-semibold">
                Admin System
              </span>
            </Link>
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className={`nav-link flex items-center space-x-2 ${
                  isActive('/') ? 'active' : ''
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/users"
                className={`nav-link flex items-center space-x-2 ${
                  isActive('/users') ? 'active' : ''
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </Link>
              <Link
                to="/audit-logs"
                className={`nav-link flex items-center space-x-2 ${
                  isActive('/audit-logs') ? 'active' : ''
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Audit Logs</span>
              </Link>
            </div>
          </div>
          <div>
            <button
              onClick={() => {/* Add logout handler */}}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
