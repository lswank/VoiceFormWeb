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

export function createRequestValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): T => {
    return schema.parse(data);
  };
}

export function createResponseValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): T => {
    return schema.parse(data);
  };
}

export async function validateApiResponse<T>(
  response: Response, 
  schema: z.ZodType<T>
): Promise<T> {
  const responseDataSchema = schema;
  const data = await response.json();
  return responseDataSchema.parse(data);
}

export async function validateApiResponseWithProperty<T>(
  response: Response, 
  schema: z.ZodType<T>,
  dataProperty?: string
): Promise<T> {
  const responseData = await response.json();
  
  if (dataProperty && responseData[dataProperty]) {
    return schema.parse(responseData[dataProperty]);
  }
  
  return schema.parse(responseData);
} 