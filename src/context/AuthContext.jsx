import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('inv_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/controllers/auth.php?action=login', { email, password });
    const { token, user: u } = res.data;
    localStorage.setItem('inv_token', token);
    localStorage.setItem('inv_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (name, email, password, role = 'staff') => {
    const res = await api.post('/controllers/auth.php?action=register', { name, email, password, role });
    const { token, user: u } = res.data;
    localStorage.setItem('inv_token', token);
    localStorage.setItem('inv_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('inv_token');
    localStorage.removeItem('inv_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
