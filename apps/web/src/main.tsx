import React, { useEffect, Suspense, lazy } from 'react';
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
import Dashboard from './pages/Dashboard';
import TasksBoard from './pages/TasksBoard';
import TasksCalendar from './pages/TasksCalendar';
import TasksTimeline from './pages/TasksTimeline';
import SupplierDetail from './pages/SupplierDetail';
import PageSkeleton from './components/PageSkeleton';
import TasksHubPageSkeleton from './components/tasks/TasksHubPageSkeleton';
import TaskDetailPageSkeleton from './components/tasks/TaskDetailPageSkeleton';

const TasksHub = lazy(() => import('./pages/TasksHub'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const DesignSamples = lazy(() => import('./pages/DesignSamples'));
import './styles.css';
import { useAuth } from './lib/use-auth';
import { setLoggerUser, logLoad } from './lib/logger';
import { setAnalyticsUser } from './lib/analytics';
import './lib/i18n';
import { logout } from './lib/api';

const qc = new QueryClient();

function LoggingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.id) {
      setLoggerUser(user.id);
      setAnalyticsUser(user.id);
      logLoad();
    }
  }, [user]);
  return <>{children}</>;
}

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
          <Route
            path="/tasks"
            element={
              <Protected>
                <Suspense fallback={<TasksHubPageSkeleton />}>
                  <TasksHub />
                </Suspense>
              </Protected>
            }
          />
          <Route
            path="/suppliers"
            element={
              <Protected>
                <Suspense fallback={<PageSkeleton />}>
                  <Suppliers />
                </Suspense>
              </Protected>
            }
          />
          <Route path="/suppliers/:id" element={<Protected><SupplierDetail /></Protected>} />
          <Route path="/tasks/board" element={<Protected><TasksBoard /></Protected>} />
          <Route path="/tasks/calendar" element={<Protected><TasksCalendar /></Protected>} />
          <Route path="/tasks/timeline" element={<Protected><TasksTimeline /></Protected>} />
          <Route
            path="/tasks/:id"
            element={
              <Protected>
                <Suspense fallback={<TaskDetailPageSkeleton />}>
                  <TaskDetail />
                </Suspense>
              </Protected>
            }
          />
          <Route
            path="/design"
            element={
              <Protected>
                <Suspense fallback={<PageSkeleton />}>
                  <DesignSamples />
                </Suspense>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function AutoLogout() {
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeout = midnight.getTime() - now.getTime();
    const id = setTimeout(() => {
      logout().finally(() => (window.location.href = '/login'));
    }, timeout);
    return () => clearTimeout(id);
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={qc}>
        <Toaster>
          <ErrorBoundary>
            <LoggingProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AutoLogout />
                <AppRoutes />
              </BrowserRouter>
            </LoggingProvider>
          </ErrorBoundary>
        </Toaster>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
