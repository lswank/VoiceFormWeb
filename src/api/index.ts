import { z } from 'zod';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

// Error type
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Common fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Include credentials for cookie-based auth
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorData = await response.json();
      throw {
        code: errorData.code || response.status.toString(),
        message: errorData.message || response.statusText,
        details: errorData.details
      } as ApiError;
    }
    
    // Empty response for 204 status
    if (response.status === 204) {
      return {} as T;
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Validate with schema if provided
    if (schema) {
      try {
        return schema.parse(data);
      } catch (error) {
        console.error('API response validation error:', error);
        throw {
          code: 'VALIDATION_ERROR',
          message: 'API response validation failed',
          details: { error }
        } as ApiError;
      }
    }
    
    return data as T;
  } catch (error) {
    if ((error as ApiError).code) {
      throw error;
    }
    
    // Handle network errors
    throw {
      code: 'NETWORK_ERROR',
      message: (error as Error).message || 'Network request failed',
      details: { error }
    } as ApiError;
  }
}

// HTTP method wrappers
export const api = {
  get: <T>(endpoint: string, schema?: z.ZodType<T>) => 
    fetchApi<T>(endpoint, { method: 'GET' }, schema),
    
  post: <T, U>(endpoint: string, data?: U, schema?: z.ZodType<T>) => 
    fetchApi<T>(
      endpoint, 
      { 
        method: 'POST', 
        body: data instanceof FormData ? data : JSON.stringify(data) 
      }, 
      schema
    ),
    
  put: <T, U>(endpoint: string, data: U, schema?: z.ZodType<T>) => 
    fetchApi<T>(
      endpoint, 
      { 
        method: 'PUT', 
        body: data instanceof FormData ? data : JSON.stringify(data) 
      }, 
      schema
    ),
    
  patch: <T, U>(endpoint: string, data: U, schema?: z.ZodType<T>) => 
    fetchApi<T>(
      endpoint, 
      { 
        method: 'PATCH', 
        body: data instanceof FormData ? data : JSON.stringify(data) 
      }, 
      schema
    ),
    
  delete: <T>(endpoint: string, schema?: z.ZodType<T>) => 
    fetchApi<T>(endpoint, { method: 'DELETE' }, schema),
};

export default api;