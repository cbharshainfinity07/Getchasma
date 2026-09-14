import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

const ADMIN_CREDENTIALS = {
  email: 'admin@getchasma.com',
  password: 'chasma@admin2026'
};

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('getchasma_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (email, password) => {
    if (
      email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const session = {
        email: ADMIN_CREDENTIALS.email,
        name: 'Master Optical Admin',
        role: 'Store Operations Lead',
        token: `adm_${Date.now()}_auth`
      };
      setAdminUser(session);
      localStorage.setItem('getchasma_admin_session', JSON.stringify(session));
      return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials. Please verify your email and security password.' };
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('getchasma_admin_session');
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAuthenticated: Boolean(adminUser), login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
