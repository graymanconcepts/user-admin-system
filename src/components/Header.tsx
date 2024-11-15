import { Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}