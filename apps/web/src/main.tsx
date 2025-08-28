import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import TasksHub from './pages/TasksHub';
import TaskDetail from './pages/TaskDetail';
import Dashboard from './pages/Dashboard';
import TasksBoard from './pages/TasksBoard';
import TasksCalendar from './pages/TasksCalendar';
import TasksTimeline from './pages/TasksTimeline';
import SuppliersList from './pages/SuppliersList';
import './styles.css';
import { useAuth } from './lib/use-auth';
import './lib/i18n';

const qc = new QueryClient();

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/tasks" element={<Protected><TasksHub /></Protected>} />
          <Route path="/suppliers" element={<Protected><SuppliersList /></Protected>} />
          <Route path="/tasks/board" element={<Protected><TasksBoard /></Protected>} />
          <Route path="/tasks/calendar" element={<Protected><TasksCalendar /></Protected>} />
          <Route path="/tasks/timeline" element={<Protected><TasksTimeline /></Protected>} />
          <Route path="/tasks/:id" element={<Protected><TaskDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={qc}>
        <Toaster>
          <ErrorBoundary>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ErrorBoundary>
        </Toaster>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
