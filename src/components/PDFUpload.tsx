import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export function PDFUpload({ onFileSelect, className }: PDFUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={twMerge(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
        isDragActive
          ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
          : 'border-secondary-300 hover:border-primary-500 dark:border-secondary-700 dark:hover:border-primary-400',
        className
      )}
    >
      <input {...getInputProps()} />
      <DocumentArrowUpIcon 
        className={twMerge(
          'h-12 w-12 transition-colors',
          isDragActive
            ? 'text-primary-500 dark:text-primary-400'
            : 'text-secondary-400 dark:text-secondary-600'
        )} 
      />
      <p className="mt-4 text-center text-base font-medium text-secondary-900 dark:text-white">
        Drag & drop a PDF file here, or click to select
      </p>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Your form will be automatically created from the PDF
      </p>
    </div>
  );
} 