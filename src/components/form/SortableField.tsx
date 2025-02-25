import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, type FieldConfig } from './Field';
import { TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface SortableFieldProps {
  field: FieldConfig;
  onUpdate: (fieldId: string, updates: Partial<FieldConfig>) => void;
  onRemove: (fieldId: string) => void;
  readOnly?: boolean;
  isHighlighted?: boolean;
}

export function SortableField({
  field,
  onUpdate,
  onRemove,
  readOnly = false,
  isHighlighted = false,
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Add a highlight animation effect
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (isHighlighted) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`field-container-${field.id}`}
      className={`relative rounded-lg border ${
        isDragging 
          ? 'border-primary-500 shadow-lg dark:border-primary-400 opacity-50 z-10 bg-primary-50 dark:bg-primary-900/20' 
          : isFlashing
            ? 'border-primary-500 shadow-lg dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/20 transition-colors duration-500'
            : 'border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800'
      } p-4 ${!readOnly ? 'group' : ''}`}
    >
      {!readOnly && (
        <div className="absolute left-2 top-2 flex items-center space-x-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
          >
            <Bars3Icon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
          </div>
        </div>
      )}
      
      <div className={!readOnly ? 'pl-8' : ''}>
        <Field
          config={field}
          onChange={(value) => onUpdate(field.id, { value })}
          readOnly={readOnly}
        />
      </div>
      
      {!readOnly && (
        <button
          type="button"
          onClick={() => onRemove(field.id)}
          className="absolute -right-2 -top-2 hidden rounded-full bg-white p-1 text-secondary-400 shadow-sm hover:bg-secondary-50 hover:text-secondary-500 group-hover:block dark:bg-secondary-700 dark:text-secondary-500 dark:hover:bg-secondary-600 dark:hover:text-secondary-400"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 