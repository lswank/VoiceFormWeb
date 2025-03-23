import { config } from '../config';

interface OcrResponse {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'multiselect' | 'url' | 'time' | 'address' | 'voice' | 'captcha';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

class OcrService {
  private apiKey: string;
  private baseUrl = 'https://api.mistral.ai/v1/ocr';

  constructor() {
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!this.apiKey && config.environment !== 'local-ui') {
      console.warn('Mistral API key not found. PDF form import will not work.');
    }
  }

  async processPdf(file: File): Promise<FormField[]> {
    if (config.environment === 'local-ui') {
      // Use mock server in local development
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/pdf/extract', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process PDF with mock server');
        }

        const data = await response.json();
        return data.fields;
      } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
      }
    }

    if (!this.apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF with Mistral OCR');
      }

      const data = await response.json();
      return this.convertOcrToFormFields(data);
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }

  private convertOcrToFormFields(ocrData: OcrResponse[]): FormField[] {
    // Group text by vertical position to identify form fields
    const fields: FormField[] = [];
    const yTolerance = 5; // pixels

    // Sort OCR results by y position
    const sortedResults = [...ocrData].sort((a, b) => a.boundingBox.y - b.boundingBox.y);

    // Group text by vertical position
    let currentGroup: OcrResponse[] = [];
    let currentY = sortedResults[0]?.boundingBox.y;

    for (const result of sortedResults) {
      if (Math.abs(result.boundingBox.y - currentY) <= yTolerance) {
        currentGroup.push(result);
      } else {
        if (currentGroup.length > 0) {
          fields.push(this.createFormField(currentGroup));
        }
        currentGroup = [result];
        currentY = result.boundingBox.y;
      }
    }

    if (currentGroup.length > 0) {
      fields.push(this.createFormField(currentGroup));
    }

    return fields;
  }

  private createFormField(group: OcrResponse[]): FormField {
    // Combine text from the group
    const text = group.map(r => r.text).join(' ').trim();

    // Try to determine field type based on text content
    let type: FormField['type'] = 'text';
    
    // Look for common patterns
    if (text.toLowerCase().includes('email')) {
      type = 'email';
    } else if (text.toLowerCase().includes('phone') || text.toLowerCase().includes('tel')) {
      type = 'tel';
    } else if (text.toLowerCase().includes('date')) {
      type = 'date';
    } else if (text.toLowerCase().includes('select') || text.toLowerCase().includes('choose')) {
      type = 'select';
    } else if (text.toLowerCase().includes('check') || text.toLowerCase().includes('tick')) {
      type = 'checkbox';
    } else if (text.toLowerCase().includes('radio') || text.toLowerCase().includes('circle')) {
      type = 'radio';
    } else if (text.toLowerCase().includes('address')) {
      type = 'address';
    } else if (text.toLowerCase().includes('url') || text.toLowerCase().includes('website')) {
      type = 'url';
    } else if (text.toLowerCase().includes('time')) {
      type = 'time';
    } else if (text.toLowerCase().includes('voice') || text.toLowerCase().includes('speak')) {
      type = 'voice';
    } else if (text.toLowerCase().includes('captcha')) {
      type = 'captcha';
    }

    // Create the field
    const field: FormField = {
      id: `field-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: text,
      required: text.toLowerCase().includes('required'),
    };

    // Add validation based on field type
    if (type === 'email') {
      field.validation = {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      };
    } else if (type === 'tel') {
      field.validation = {
        pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$',
      };
    }

    return field;
  }
}

export const ocrService = new OcrService(); 