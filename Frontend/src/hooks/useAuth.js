import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile as updateProfileApi } from '../api/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      setUser(prev => ({ ...prev, ...res.data }));
    } catch {
      // Profile fetch failed — keep basic user info from token
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('farmplus_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check expiry
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser({ phone_number: payload.phone_number });
        } else {
          localStorage.removeItem('farmplus_token');
        }
      } catch {
        localStorage.removeItem('farmplus_token');
      }
    }
    setLoading(false);
  }, []);

  // Fetch full profile once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const login = useCallback((token) => {
    localStorage.setItem('farmplus_token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ phone_number: payload.phone_number });
    } catch {}
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('farmplus_token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const res = await updateProfileApi(data);
    if (res.data.user) {
      setUser(prev => ({ ...prev, ...res.data.user }));
    }
    return res.data;
  }, []);

  return { isAuthenticated, user, loading, login, logout, updateUser, fetchProfile };
}
