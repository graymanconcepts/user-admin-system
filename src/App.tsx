import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import UserDetails from './pages/UserDetails';
import AuditLogs from './pages/AuditLogs';
import OrganizationPage from './pages/OrganizationPage';
import MetadataPage from './pages/MetadataPage';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/organization" element={<OrganizationPage />} />
            <Route path="/metadata" element={<MetadataPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            background: '#1A2426',
            color: '#E2E8F0',
            border: '1px solid rgba(28, 59, 59, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#7AB800',
              secondary: '#1A2426',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#1A2426',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;