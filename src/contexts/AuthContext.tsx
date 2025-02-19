import { createContext, useContext, useState, useCallback } from 'react';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: (provider: 'google' | 'microsoft') => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    // TODO: Implement actual authentication
    setIsAuthenticated(true);
  }, []);

  const loginWithSSO = useCallback(async (provider: 'google' | 'microsoft') => {
    // TODO: Implement actual SSO authentication
    console.log(`Logging in with ${provider}`);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (data: RegistrationData) => {
    // TODO: Implement actual registration
    console.log('Registering user:', data);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithSSO, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 