import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated,  setIsAuthenticated]  = useState(false);
  const [proAuthenticated, setProAuthenticated] = useState(false);
  const [loading,           setLoading]          = useState(true);

  useEffect(() => {
    setIsAuthenticated (sessionStorage.getItem('mh_auth')     === 'true');
    setProAuthenticated(sessionStorage.getItem('mh_pro_auth') === 'true');
    setLoading(false);
  }, []);

  /** Connexion principale (accès à l'app) */
  const login = (code) => {
    const valid = import.meta.env.VITE_ACCESS_CODE || 'matths2024';
    if (code === valid) {
      sessionStorage.setItem('mh_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  /** Connexion espace Pro */
  const loginPro = (code) => {
    const proCode = import.meta.env.VITE_PRO_CODE
      || import.meta.env.VITE_ACCESS_CODE
      || 'matths2024';
    if (code === proCode) {
      sessionStorage.setItem('mh_pro_auth', 'true');
      setProAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    ['mh_auth', 'mh_pro_auth'].forEach(k => sessionStorage.removeItem(k));
    setIsAuthenticated(false);
    setProAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, proAuthenticated, login, loginPro, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
