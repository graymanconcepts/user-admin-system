import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchAuditLogs, fetchUsers } from '../api/users';

export default function AuditLogs() {
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: fetchAuditLogs
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  // Create a mapping of user IDs to names
  const userMap = users.reduce((acc: { [key: string]: string }, user: any) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

  // Debug logs
  console.log('Users:', users);
  console.log('User Map:', userMap);
  console.log('Audit Logs:', logs);

  const isLoading = isLoadingLogs || isLoadingUsers;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Audit Logs</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="table-header">Timestamp</th>
                <th className="table-header">Action</th>
                <th className="table-header">User</th>
                <th className="table-header">Performed By</th>
                <th className="table-header">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-disabled">Loading...</td>
                </tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="border-t border-primary-300/20">
                  <td className="table-cell text-text-secondary">
                    {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-info">
                      {log.action}
                    </span>
                  </td>
                  <td className="table-cell text-text-primary">
                    {log.userId ? (log.userName || 'Unknown User') : '—'}
                  </td>
                  <td className="table-cell text-text-primary">
                    {userMap[log.performedBy] || log.performerEmail || 'Unknown User'}
                  </td>
                  <td className="table-cell text-text-secondary">
                    {log.details}
                  </td>
                </tr>
              ))}
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-disabled">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}