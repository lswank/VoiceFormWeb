import { z } from 'zod';
import api from './index';
import { fieldSchema } from '../schemas/form';

// Define PDF extract response type
export interface PDFExtractResponse {
  fields: z.infer<typeof fieldSchema>[];
}

// PDF API methods
export const pdfApi = {
  /**
   * Extract form fields from PDF
   */
  extractPDFFields: (pdfFile: File) => {
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    
    return api.post<PDFExtractResponse>(
      '/pdf/extract', 
      formData, 
      z.object({
        fields: z.array(fieldSchema)
      })
    );
  }
};

export default pdfApi;