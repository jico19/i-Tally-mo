import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardDetailPage from './pages/BoardDetailPage';
import SummaryPage from './pages/SummaryPage';
import { RefreshCw } from 'lucide-react';

/**
 * Route guard that requires an active Supabase user session.
 */
export function RequireAuth() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * Route guard for public-only pages like /login when already authenticated.
 */
export function PublicOnly() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export const routes = [
  {
    element: <PublicOnly />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      }
    ]
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <DashboardPage />
      },
      {
        path: '/board/:boardId',
        element: <BoardDetailPage />
      },
      {
        path: '/summary',
        element: <SummaryPage />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];
