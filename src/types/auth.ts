export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithSSO: (provider: 'google' | 'microsoft') => Promise<void>;
} 