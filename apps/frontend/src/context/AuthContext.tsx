import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'dealer' | 'participante';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('daa_token');
      const savedUser = localStorage.getItem('daa_user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('No se pudo restaurar la sesión guardada.', error);
          localStorage.removeItem('daa_token');
          localStorage.removeItem('daa_user');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('daa_token', newToken);
    localStorage.setItem('daa_user', JSON.stringify(newUser));
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('daa_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('daa_token');
    localStorage.removeItem('daa_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};