import { z } from 'zod';
import api from './index';
import { fieldSchema } from '../schemas/form';

// Define AI request and response types
export interface AIProcessRequest {
  audioData: Blob;
  fieldContext: z.infer<typeof fieldSchema>;
  previousResponses?: Record<string, any>;
}

export interface AIProcessResponse {
  text: string;
  confidence: number;
  alternatives?: string[];
}

export interface AIClarifyRequest {
  fieldContext: z.infer<typeof fieldSchema>;
  currentValue: string;
  previousResponses?: Record<string, any>;
}

export interface AIClarifyResponse {
  prompts: string[];
}

export interface AIValidateRequest {
  fieldContext: z.infer<typeof fieldSchema>;
  value: string;
}

export interface AIValidateResponse {
  valid: boolean;
  message?: string;
}

// Define Zod schemas for validation
const aiProcessResponseSchema = z.object({
  text: z.string(),
  confidence: z.number(),
  alternatives: z.array(z.string()).optional()
});

const aiClarifyResponseSchema = z.object({
  prompts: z.array(z.string())
});

const aiValidateResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string().optional()
});

// AI API methods
export const aiApi = {
  /**
   * Process voice input for form field
   */
  processVoiceInput: (request: AIProcessRequest) => {
    const formData = new FormData();
    formData.append('audioData', request.audioData);
    formData.append('fieldContext', JSON.stringify(request.fieldContext));
    
    if (request.previousResponses) {
      formData.append('previousResponses', JSON.stringify(request.previousResponses));
    }
    
    return api.post<AIProcessResponse>('/ai/process', formData, aiProcessResponseSchema);
  },
  
  /**
   * Generate clarification prompts
   */
  generateClarificationPrompts: (request: AIClarifyRequest) => 
    api.post<AIClarifyResponse>('/ai/clarify', request, aiClarifyResponseSchema),
  
  /**
   * Validate field response
   */
  validateFieldResponse: (request: AIValidateRequest) => 
    api.post<AIValidateResponse>('/ai/validate', request, aiValidateResponseSchema)
};

export default aiApi;