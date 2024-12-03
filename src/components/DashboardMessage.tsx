import { useAuth } from '../hooks/useAuth';

export default function DashboardMessage() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] || 'User';

  return (
    <div className="mt-16 p-6 bg-primary-800 rounded-lg shadow-lg text-center">
      <h2 className="text-3xl font-bold text-text-primary leading-tight">
        Welcome back {name}! Your workspace is prepared with the latest insights and tasks.
      </h2>
    </div>
  );
}
