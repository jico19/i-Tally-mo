import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './router';
import BottomNav from './components/BottomNav';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const element = useRoutes(routes);
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <div className="flex-1">
        {element}
      </div>
      {session && <BottomNav />}
    </div>
  );
}
