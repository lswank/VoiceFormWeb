import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { Input } from './Input';
import { Button } from './Button';

type ImportMethod = 'pdf' | 'image' | 'url';

interface ImportFormProps {
  method: ImportMethod;
  onFileSelect: (file: File) => void;
  onUrlSubmit?: (url: string) => void;
  className?: string;
}

export function ImportForm({ method, onFileSelect, onUrlSubmit, className }: ImportFormProps) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: method === 'pdf' 
      ? { 'application/pdf': ['.pdf'] }
      : { 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  });

  if (method === 'url') {
    return (
      <div className={twMerge('space-y-4 rounded-lg border-2 border-dashed border-secondary-300 p-8 dark:border-secondary-700', className)}>
        <div className="text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-600" />
          <h3 className="mt-4 text-base font-medium text-secondary-900 dark:text-white">
            Import from URL
          </h3>
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
            Enter the URL of the form you want to import
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/form"
            className="flex-1"
          />
          <Button onClick={() => onUrlSubmit?.(url)} disabled={!url}>
            Import
          </Button>
        </div>
      </div>
    );
  }

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
      {method === 'pdf' ? (
        <DocumentArrowUpIcon 
          className={twMerge(
            'h-12 w-12 transition-colors',
            isDragActive
              ? 'text-primary-500 dark:text-primary-400'
              : 'text-secondary-400 dark:text-secondary-600'
          )} 
        />
      ) : (
        <PhotoIcon 
          className={twMerge(
            'h-12 w-12 transition-colors',
            isDragActive
              ? 'text-primary-500 dark:text-primary-400'
              : 'text-secondary-400 dark:text-secondary-600'
          )} 
        />
      )}
      <p className="mt-4 text-center text-base font-medium text-secondary-900 dark:text-white">
        Drag & drop a {method === 'pdf' ? 'PDF file' : 'screenshot'} here, or click to select
      </p>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Your form will be automatically created from the {method === 'pdf' ? 'PDF' : 'image'}
      </p>
    </div>
  );
} 