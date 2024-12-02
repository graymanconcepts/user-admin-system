import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar />
      <div className="ml-64">
        <main className="container mx-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}