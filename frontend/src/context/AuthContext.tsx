import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LearningSpace } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  spaces: LearningSpace[];
  activeSpace: LearningSpace | null;
  isLoading: boolean;
  login: (credentials: { username_or_email: string; password: string }) => Promise<void>;
  register: (data: { email: string; username: string; password: string; role: 'learner' | 'companion'; avatar?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshSpaces: () => Promise<void>;
  setActiveSpace: (space: LearningSpace | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<LearningSpace[]>([]);
  const [activeSpace, setActiveSpace] = useState<LearningSpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      localStorage.setItem('javaquest_user', JSON.stringify(userData));
    } catch {
      setUser(null);
    }
  };

  const refreshSpaces = async () => {
    try {
      const spaceList = await api.getMySpaces();
      setSpaces(spaceList);
      if (spaceList.length > 0 && !activeSpace) {
        setActiveSpace(spaceList[0]);
      }
    } catch {
      setSpaces([]);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('javaquest_token');
      if (token) {
        await refreshProfile();
        await refreshSpaces();
      }
      setIsLoading(false);
    };

    initAuth();

    const handleLogout = () => {
      setUser(null);
      setSpaces([]);
      setActiveSpace(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (credentials: { username_or_email: string; password: string }) => {
    const data = await api.login(credentials);
    localStorage.setItem('javaquest_token', data.access_token);
    localStorage.setItem('javaquest_user', JSON.stringify(data.user));
    setUser(data.user);
    await refreshSpaces();
  };

  const register = async (data: { email: string; username: string; password: string; role: 'learner' | 'companion'; avatar?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('javaquest_token', res.access_token);
    localStorage.setItem('javaquest_user', JSON.stringify(res.user));
    setUser(res.user);
    await refreshSpaces();
  };

  const logout = () => {
    localStorage.removeItem('javaquest_token');
    localStorage.removeItem('javaquest_user');
    setUser(null);
    setSpaces([]);
    setActiveSpace(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        spaces,
        activeSpace,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        refreshSpaces,
        setActiveSpace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
