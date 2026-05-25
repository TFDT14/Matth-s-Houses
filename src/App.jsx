import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import QuoteGenerator from './pages/QuoteGenerator';
import MediaLibrary   from './pages/MediaLibrary';
import ClientTracking from './pages/ClientTracking';
import Layout         from './components/Layout';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mh-paper-2">
      <span className="w-7 h-7 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index        element={<Dashboard />}      />
        <Route path="devis" element={<QuoteGenerator />} />
        <Route path="media" element={<MediaLibrary />}   />
        <Route path="clients" element={<ClientTracking />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
