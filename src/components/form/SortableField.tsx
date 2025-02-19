import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, type FieldConfig } from './Field';

interface SortableFieldProps {
  field: FieldConfig;
  mode: 'builder' | 'display' | 'edit';
  onConfigChange: (updates: Partial<FieldConfig>) => void;
  onRemove: () => void;
}

export function SortableField({ field, mode, onConfigChange, onRemove }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field',
      field,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
    >
      <Field
        config={field}
        mode={mode}
        onConfigChange={onConfigChange}
        className="cursor-move"
      />
      {mode === 'builder' && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-12 top-2 hidden rounded-md p-2 text-secondary-400 hover:text-secondary-500 group-hover:block dark:text-secondary-500 dark:hover:text-secondary-400"
        >
          Remove
        </button>
      )}
      {mode === 'builder' && (
        <div
          className="absolute inset-y-0 left-0 w-8 cursor-move"
          {...listeners}
        />
      )}
    </div>
  );
} 