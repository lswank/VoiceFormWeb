import { useState, useRef } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { ocrService } from '../../services/ocrService';
import { formService } from '../../services/formService';
import toast from 'react-hot-toast';
import { useFeatures } from '../../contexts/hooks/useFeatures';

interface PdfFormUploaderProps {
  onFormCreated: (formId: string) => void;
}

export function PdfFormUploader({ onFormCreated }: PdfFormUploaderProps) {
  const { features } = useFeatures();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!features.enablePdfFormImport) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Process the PDF with OCR
      const fields = await ocrService.processPdf(file);

      // Create a new form with the extracted fields
      const form = await formService.createForm({
        title: file.name.replace('.pdf', ''),
        description: 'Form imported from PDF',
        fields: fields.map(field => ({
          ...field,
          type: field.type === 'tel' ? 'phone' : field.type,
        })),
        status: 'draft',
        scope: 'personal',
        userId: 'current-user', // This should be replaced with the actual user ID
        responseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success('Form created successfully!');
      onFormCreated(form.id);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      toast.error('Failed to create form from PDF');
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        disabled={isUploading}
        onClick={handleButtonClick}
      >
        <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
        {isUploading ? 'Processing...' : 'Import PDF Form'}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 