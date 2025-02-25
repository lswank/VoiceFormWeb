import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { type FieldConfig, type FieldType } from './Field';
import { FieldPalette } from './FieldPalette';
import { Button } from '../Button';
import { Input } from '../Input';
import type { Form } from '../../schemas/form';
import { SortableField } from './SortableField';
import { Field } from './Field';

interface FormConfig {
  title: string;
  description: string;
  fields: FieldConfig[];
}

const initialForm: FormConfig = {
  title: 'Untitled Form',
  description: '',
  fields: [],
};

let fieldIdCounter = 1;

interface FormBuilderProps {
  form?: Form;
  readOnly?: boolean;
  onChange?: (form: Form) => void;
  hideAddField?: boolean;
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function FormBuilder({ form, readOnly = false, onChange, hideAddField = false }: FormBuilderProps) {
  const [formConfig, setFormConfig] = useState<FormConfig>(() => {
    if (!form) return initialForm;
    
    return {
      title: form.title,
      description: form.description || '',
      fields: form.fields.map(field => ({
        ...field,
        options: field.options?.map(opt => ({
          value: opt.value,
          label: opt.label,
        })),
      })),
    };
  });

  // Add state for active dragging
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeField = activeId ? formConfig.fields.find(field => field.id === activeId) : null;

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move 8px before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update internal state when form prop changes
  useEffect(() => {
    if (form) {
      setFormConfig({
        title: form.title,
        description: form.description || '',
        fields: form.fields.map(field => ({
          ...field,
          options: field.options?.map(opt => ({
            value: opt.value,
            label: opt.label,
          })),
        })),
      });
    }
  }, [form]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        ...(form ?? {
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'preview',
          status: 'draft',
          responseCount: 0,
          scope: 'personal',
        }),
        title: formConfig.title,
        description: formConfig.description,
        fields: formConfig.fields,
      });
    }
  }, [formConfig, form, onChange]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    
    if (readOnly) return;
    
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = formConfig.fields.findIndex(f => f.id === active.id);
      const newIndex = formConfig.fields.findIndex(f => f.id === over.id);

      const newFields = [...formConfig.fields];
      const [removed] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, removed);

      setFormConfig(prev => ({ ...prev, fields: newFields }));
    }
  };

  const handleAddField = (type: FieldType) => {
    if (readOnly) return;
    
    const newField: FieldConfig = {
      id: `field-${fieldIdCounter++}`,
      type,
      label: `New ${type} field`,
      required: false,
    };

    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldConfig>) => {
    if (readOnly) return;
    
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const handleRemoveField = (fieldId: string) => {
    if (readOnly) return;
    
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Field Palette */}
      {!readOnly && !hideAddField && (
        <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800">
          <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
            Add Field
          </h3>
          <FieldPalette onSelect={handleAddField} />
        </div>
      )}

      {/* Form Fields */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={formConfig.fields.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {formConfig.fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                onUpdate={handleUpdateField}
                onRemove={handleRemoveField}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay for visual feedback */}
        <DragOverlay adjustScale style={{ transformOrigin: '0 0' }}>
          {activeField ? (
            <div className="rounded-lg border border-primary-500 bg-white shadow-lg dark:bg-secondary-800">
              <Field
                config={activeField}
                onChange={() => {}}
                readOnly={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {formConfig.fields.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-secondary-300 p-8 text-center dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {readOnly
              ? 'No fields in this form yet.'
              : 'Start by adding some fields to your form.'}
          </p>
        </div>
      )}
    </div>
  );
} 