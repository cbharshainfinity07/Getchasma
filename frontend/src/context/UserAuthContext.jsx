import React, { createContext, useContext, useState, useEffect } from 'react';

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chasma_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      // Refresh profile and membership from server
      fetch(`http://localhost:5001/api/users/profile/${user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(freshUser => {
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('chasma_user', JSON.stringify(freshUser));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch('http://localhost:5001/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }

    const userData = await res.json();
    setUser(userData);
    localStorage.setItem('chasma_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await fetch('http://localhost:5001/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }

    const userData = await res.json();
    setUser(userData);
    localStorage.setItem('chasma_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chasma_user');
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');
    const res = await fetch(`http://localhost:5001/api/users/profile/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update failed');
    }

    const updated = await res.json();
    setUser(updated);
    localStorage.setItem('chasma_user', JSON.stringify(updated));
    return updated;
  };

  const activateMembership = async (plan = '1-Year Gold Pass', durationYears = 1) => {
    if (!user) throw new Error('Please login to activate VIP membership');
    const res = await fetch(`http://localhost:5001/api/users/${user.id}/membership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, durationYears })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Membership activation failed');
    }

    const updated = await res.json();
    setUser(updated);
    localStorage.setItem('chasma_user', JSON.stringify(updated));
    return updated;
  };

  const fetchUserOrders = async () => {
    if (!user || !user.email) return [];
    const res = await fetch(`http://localhost:5001/api/orders?email=${encodeURIComponent(user.email)}`);
    if (!res.ok) return [];
    return await res.json();
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      loading,
      isLoggedIn: !!user,
      isMember: !!(user && user.isMember),
      login,
      register,
      logout,
      updateProfile,
      activateMembership,
      fetchUserOrders
    }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => useContext(UserAuthContext);
