import { z } from 'zod';
import api from './index';
import { authResponseSchema } from '../schemas/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

// Auth API methods
export const authApi = {
  /**
   * Log in with email and password
   */
  login: (credentials: LoginCredentials) => 
    api.post('/auth/login', credentials, authResponseSchema),
  
  /**
   * Register a new user
   */
  register: (userData: RegisterRequest) => 
    api.post('/auth/register', userData, authResponseSchema),
  
  /**
   * Log in with SSO provider (Google or Microsoft)
   */
  ssoLogin: (provider: 'google' | 'microsoft', token: string) => 
    api.post(`/auth/sso/${provider}`, { token }, authResponseSchema),
  
  /**
   * Log out the current user
   */
  logout: () => 
    api.post('/auth/logout', undefined, z.object({ success: z.boolean() })),
  
  /**
   * Request a password reset
   */
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }, z.object({ success: z.boolean() })),
};

export default authApi;