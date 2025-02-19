import { type FieldType } from './Field';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  DocumentTextIcon,
  HashtagIcon,
  EnvelopeIcon,
  CalendarIcon,
  ListBulletIcon,
  Square2StackIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  description: string;
}

const fieldTypes: FieldTypeOption[] = [
  {
    type: 'text',
    label: 'Text',
    icon: DocumentTextIcon,
    description: 'Single line text input',
  },
  {
    type: 'number',
    label: 'Number',
    icon: HashtagIcon,
    description: 'Numeric input',
  },
  {
    type: 'email',
    label: 'Email',
    icon: EnvelopeIcon,
    description: 'Email address input',
  },
  {
    type: 'date',
    label: 'Date',
    icon: CalendarIcon,
    description: 'Date picker',
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: ListBulletIcon,
    description: 'Single select dropdown',
  },
  {
    type: 'multiselect',
    label: 'Multi Select',
    icon: Square2StackIcon,
    description: 'Multiple select dropdown',
  },
  {
    type: 'voice',
    label: 'Voice Input',
    icon: MicrophoneIcon,
    description: 'Voice recording input',
  },
];

interface DraggableFieldButtonProps {
  fieldType: FieldTypeOption;
}

function DraggableFieldButton({ fieldType }: DraggableFieldButtonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `palette-${fieldType.type}`,
    data: {
      type: 'new-field',
      fieldType: fieldType.type,
    },
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  const Icon = fieldType.icon;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={twMerge(
        'flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors',
        'hover:bg-secondary-50 dark:hover:bg-secondary-700',
        isDragging && 'opacity-50',
        'cursor-grab active:cursor-grabbing'
      )}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Icon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
      <div>
        <div className="text-sm font-medium text-secondary-900 dark:text-white">
          {fieldType.label}
        </div>
        <div className="text-xs text-secondary-500 dark:text-secondary-400">
          {fieldType.description}
        </div>
      </div>
    </button>
  );
}

interface FieldPaletteProps {
  onFieldSelect: (type: FieldType) => void;
}

export function FieldPalette({ onFieldSelect }: FieldPaletteProps) {
  return (
    <div className="divide-y divide-secondary-200 rounded-lg border border-secondary-200 bg-white dark:divide-secondary-700 dark:border-secondary-700 dark:bg-secondary-800">
      <div className="px-4 py-3">
        <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
          Form Fields
        </h3>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Drag and drop fields onto the canvas
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {fieldTypes.map((fieldType) => (
            <DraggableFieldButton
              key={fieldType.type}
              fieldType={fieldType}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 