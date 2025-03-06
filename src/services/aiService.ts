import { FieldConfig } from '../components/form/Field';
import { config } from '../config';

export interface AIProcessingResult {
  fieldValues: Record<string, string>;
  needsClarification: boolean;
  clarificationPrompt?: {
    fieldId: string;
    question: string;
    options?: string[];
  };
  confidence: number;
}

// Mock AI processing for local-ui mode
function mockProcessVoiceInput(
  transcript: string,
  fields: FieldConfig[],
  currentValues: Record<string, string>
): AIProcessingResult {
  // Simulate processing delay
  const processedValues: Record<string, string> = {};
  const words = transcript.toLowerCase().split(' ');

  // Simple pattern matching for field values
  fields.forEach(field => {
    const currentValue = currentValues[field.id] || '';

    // Try to find values based on field type and label
    if (field.type === 'email' && words.some(w => w.includes('@'))) {
      const emailWord = words.find(w => w.includes('@')) || '';
      processedValues[field.id] = emailWord;
    } else if (field.type === 'phone' && words.some(w => w.match(/\d{3,}/))) {
      const phoneWord = words.find(w => w.match(/\d{3,}/)) || '';
      processedValues[field.id] = phoneWord;
    } else if (field.type === 'select' && field.options) {
      const option = field.options.find(opt => 
        words.includes(opt.label.toLowerCase()) || 
        words.includes(opt.value.toLowerCase())
      );
      if (option) {
        processedValues[field.id] = option.value;
      }
    } else if (field.type === 'multiselect' && field.options) {
      const selectedOptions = field.options.filter(opt =>
        words.includes(opt.label.toLowerCase()) ||
        words.includes(opt.value.toLowerCase())
      );
      if (selectedOptions.length > 0) {
        processedValues[field.id] = selectedOptions.map(opt => opt.value).join(',');
      }
    } else {
      // For text fields, use the entire transcript if it contains the field label
      if (words.includes(field.label.toLowerCase())) {
        const labelIndex = words.indexOf(field.label.toLowerCase());
        processedValues[field.id] = words.slice(labelIndex + 1).join(' ');
      }
    }

    // If no value was found and there's a current value, keep it
    if (!processedValues[field.id] && currentValue) {
      processedValues[field.id] = currentValue;
    }
  });

  // Simulate clarification needs
  const needsClarification = Math.random() > 0.8;
  const unfilledFields = fields.filter(f => !processedValues[f.id] && f.required);

  return {
    fieldValues: processedValues,
    needsClarification: needsClarification && unfilledFields.length > 0,
    clarificationPrompt: needsClarification && unfilledFields.length > 0 ? {
      fieldId: unfilledFields[0].id,
      question: `Could you please provide the ${unfilledFields[0].label}?`,
      options: unfilledFields[0].type === 'select' ? unfilledFields[0].options?.map(opt => opt.label) : undefined,
    } : undefined,
    confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1
  };
}

// Mock clarification prompt generation for local-ui mode
function mockGenerateClarificationPrompt(
  field: FieldConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transcript: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: Record<string, string>
): { question: string; options?: string[] } {
  if (field.type === 'select' || field.type === 'multiselect') {
    return {
      question: `Please choose from the following options for ${field.label}:`,
      options: field.options?.map(opt => opt.label),
    };
  }

  return {
    question: `Could you please provide the ${field.label}?`,
  };
}

// Mock response validation for local-ui mode
function mockValidateResponse(
  field: FieldConfig,
  value: string
): { isValid: boolean; error?: string; suggestion?: string } {
  // Simulate validation based on field type
  if (field.type === 'email' && !value.includes('@')) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
      suggestion: value + '@example.com',
    };
  }

  if (field.type === 'phone' && !value.match(/\d{10}/)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
    };
  }

  if (field.required && !value) {
    return {
      isValid: false,
      error: `${field.label} is required`,
    };
  }

  return {
    isValid: true,
  };
}

class AIService {
  async processVoiceInput(
    transcript: string,
    fields: FieldConfig[],
    currentValues: Record<string, string>
  ): Promise<AIProcessingResult> {
    if (config.environment === 'local-ui') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockProcessVoiceInput(transcript, fields, currentValues);
    }

    const response = await fetch(`${config.apiUrl}/ai/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        fields,
        currentValues,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process voice input');
    }

    return response.json();
  }

  async generateClarificationPrompt(
    field: FieldConfig,
    transcript: string,
    context: Record<string, string>
  ): Promise<{
    question: string;
    options?: string[];
  }> {
    if (config.environment === 'local-ui') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockGenerateClarificationPrompt(field, transcript, context);
    }

    const response = await fetch(`${config.apiUrl}/ai/clarify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field,
        transcript,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate clarification prompt');
    }

    return response.json();
  }

  async validateResponse(
    field: FieldConfig,
    value: string
  ): Promise<{
    isValid: boolean;
    error?: string;
    suggestion?: string;
  }> {
    if (config.environment === 'local-ui') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockValidateResponse(field, value);
    }

    const response = await fetch(`${config.apiUrl}/ai/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field,
        value,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to validate response');
    }

    return response.json();
  }
}

export const aiService = new AIService(); 