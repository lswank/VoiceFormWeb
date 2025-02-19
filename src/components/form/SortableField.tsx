import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, type FieldConfig } from './Field';
import { TrashIcon } from '@heroicons/react/24/outline';

interface SortableFieldProps {
  field: FieldConfig;
  onUpdate: (fieldId: string, updates: Partial<FieldConfig>) => void;
  onRemove: (fieldId: string) => void;
  readOnly?: boolean;
}

export function SortableField({
  field,
  onUpdate,
  onRemove,
  readOnly = false,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800 ${
        isDragging ? 'opacity-50' : ''
      } ${!readOnly ? 'group cursor-move' : ''}`}
      {...(!readOnly ? attributes : {})}
      {...(!readOnly ? listeners : {})}
    >
      <Field
        config={field}
        onChange={(value) => onUpdate(field.id, { value })}
        readOnly={readOnly}
      />
      
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