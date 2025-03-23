import { createContext, useContext } from 'react';

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: (provider: 'google' | 'microsoft') => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 