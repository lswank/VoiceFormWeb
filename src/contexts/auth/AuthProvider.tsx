import { useState, ReactNode } from 'react';
import { AuthContext, RegistrationData } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, _password: string) => {
    console.log(`Logging in with email: ${email}`);
    setIsAuthenticated(true);
  };

  const loginWithSSO = async (provider: 'google' | 'microsoft') => {
    console.log(`Logging in with ${provider}`);
    setIsAuthenticated(true);
  };

  const register = async (data: RegistrationData) => {
    console.log(`Registering new user: ${data.email}`);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithSSO, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 