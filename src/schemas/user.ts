import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'editor', 'viewer']);

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  organization: z.string().optional(),
  role: userRoleSchema,
});

// Login credentials schema
export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Auth response schema
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

// Auth state schema
export const authStateSchema = z.object({
  user: userSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
});

// Export types derived from schemas
export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthState = z.infer<typeof authStateSchema>; 