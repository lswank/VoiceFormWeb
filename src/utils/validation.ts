import { z } from 'zod';

export class ValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super('Validation Error');
    this.name = 'ValidationError';
  }
}

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Response validation failed:', error.errors);
      throw new ValidationError(error);
    }
    throw error;
  }
}

export function createRequestValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateRequest(schema, data);
}

export function createResponseValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateResponse(schema, data);
} 