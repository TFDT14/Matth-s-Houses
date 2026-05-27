import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }      from './contexts/AuthContext';
import { PricesProvider }             from './contexts/PricesContext';
import Login         from './pages/Login';
import SpaceSelector from './pages/SpaceSelector';
import SalesSpace    from './pages/SalesSpace';
import Dashboard     from './pages/Dashboard';
import QuoteGenerator from './pages/QuoteGenerator';
import MediaLibrary  from './pages/MediaLibrary';
import ClientTracking from './pages/ClientTracking';
import PriceManager  from './pages/PriceManager';
import Layout        from './components/Layout';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mh-paper-2">
      <span className="w-7 h-7 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin" />
    </div>
  );
}

/** Route accessible si authentifié (code principal) */
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Route accessible si authentifié Pro */
function ProRoute({ children }) {
  const { isAuthenticated, proAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!proAuthenticated) return <Navigate to="/select" replace />;
  return children;
}

/** Redirection intelligente depuis "/" */
function SmartRedirect() {
  const { isAuthenticated, proAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!proAuthenticated) return <Navigate to="/select" replace />;
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Sélecteur d'espace (après connexion principale) */}
      <Route path="/select" element={
        <AuthRoute><SpaceSelector /></AuthRoute>
      } />

      {/* Espace Vente */}
      <Route path="/vente" element={
        <AuthRoute><SalesSpace /></AuthRoute>
      } />

      {/* Espace Pro — layout avec TopNav */}
      <Route path="/" element={
        <ProRoute><Layout /></ProRoute>
      }>
        <Route index          element={<Dashboard />}     />
        <Route path="devis"   element={<QuoteGenerator />} />
        <Route path="media"   element={<MediaLibrary />}  />
        <Route path="clients" element={<ClientTracking />} />
        <Route path="prix"    element={<PriceManager />}  />
      </Route>

      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PricesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PricesProvider>
    </AuthProvider>
  );
}
