import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { User, UserRole } from '../types/index.js';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  department: string;
  year?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  demoLogin: (param: 'STUDENT' | 'FACULTY' | 'ADMIN' | { role?: 'STUDENT' | 'FACULTY' | 'ADMIN'; email?: string }) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  isFaculty: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('smart_assessment_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smart_assessment_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
          localStorage.setItem('smart_assessment_user', JSON.stringify(res.data.data));
        }
      } catch {
        // Session invalid
        localStorage.removeItem('smart_assessment_token');
        localStorage.removeItem('smart_assessment_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data.data;
      localStorage.setItem('smart_assessment_token', newToken);
      localStorage.setItem('smart_assessment_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const demoLogin = async (param: 'STUDENT' | 'FACULTY' | 'ADMIN' | { role?: 'STUDENT' | 'FACULTY' | 'ADMIN'; email?: string }): Promise<User> => {
    const payload = typeof param === 'string' ? { role: param } : param;
    const res = await api.post('/auth/demo-login', payload);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data.data;
      localStorage.setItem('smart_assessment_token', newToken);
      localStorage.setItem('smart_assessment_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data.message || 'Demo login failed');
  };

  const register = async (data: RegisterData): Promise<User> => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data.data;
      localStorage.setItem('smart_assessment_token', newToken);
      localStorage.setItem('smart_assessment_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('smart_assessment_token');
    localStorage.removeItem('smart_assessment_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('smart_assessment_user', JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.error('Failed to refresh user profile:', e);
    }
  };

  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
        isStudent,
        isFaculty,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
