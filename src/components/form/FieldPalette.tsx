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
  PhoneIcon,
  GlobeAltIcon,
  RadioIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowsPointingOutIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  StarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { Hoverable3D } from '../Hoverable3D';

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
  {
    type: 'phone',
    label: 'Phone',
    icon: PhoneIcon,
    description: 'Phone number input',
  },
  {
    type: 'url',
    label: 'URL',
    icon: GlobeAltIcon,
    description: 'Website URL input',
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: RadioIcon,
    description: 'Single choice selection',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: CheckIcon,
    description: 'Yes/No checkbox',
  },
  {
    type: 'checkbox-group',
    label: 'Checkbox Group',
    icon: CheckCircleIcon,
    description: 'Multiple checkbox selection',
  },
  {
    type: 'toggle',
    label: 'Toggle Switch',
    icon: ArrowsPointingOutIcon,
    description: 'On/Off toggle switch',
  },
  {
    type: 'time',
    label: 'Time',
    icon: ClockIcon,
    description: 'Time selector',
  },
  {
    type: 'datetime',
    label: 'Date & Time',
    icon: CalendarDaysIcon,
    description: 'Date and time selection',
  },
  {
    type: 'slider',
    label: 'Slider',
    icon: ArrowsPointingOutIcon,
    description: 'Range slider control',
  },
  {
    type: 'star-rating',
    label: 'Star Rating',
    icon: StarIcon,
    description: 'Star rating selector',
  },
  {
    type: 'address',
    label: 'Address',
    icon: MapPinIcon,
    description: 'Complete address form',
  },
  {
    type: 'currency',
    label: 'Currency',
    icon: CurrencyDollarIcon,
    description: 'Monetary amount input',
  },
  {
    type: 'captcha',
    label: 'CAPTCHA',
    icon: ShieldCheckIcon,
    description: 'Human verification',
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
  onSelect: (type: FieldType) => void;
}

export function FieldPalette({ onSelect }: FieldPaletteProps) {
  return (
    <div className="flex flex-col space-y-2">
      {fieldTypes.map((fieldType) => (
        <Hoverable3D
          key={fieldType.type}
          as="button"
          type="button"
          onClick={() => onSelect(fieldType.type)}
          intensity="medium"
          className="flex w-full items-start gap-3 rounded-lg border border-secondary-200 bg-white p-3 text-left transition-all hover:border-primary-500 hover:ring-1 hover:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:hover:border-primary-400 dark:hover:ring-primary-400"
        >
          <fieldType.icon className="h-5 w-5 text-secondary-400 transition-colors group-hover:text-primary-500 dark:text-secondary-500 dark:group-hover:text-primary-400" />
          <div>
            <p className="text-sm font-medium text-secondary-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {fieldType.label}
            </p>
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              {fieldType.description}
            </p>
          </div>
        </Hoverable3D>
      ))}
    </div>
  );
} 