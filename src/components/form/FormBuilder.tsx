import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { type FieldConfig, type FieldType } from './Field';
import { FieldPalette } from './FieldPalette';
import { Button } from '../Button';
import { Input } from '../Input';
import { type Form } from '../../types/form';
import { SortableField } from './SortableField';

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
}

export function FormBuilder({ form, readOnly = false, onChange }: FormBuilderProps) {
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

  useEffect(() => {
    if (onChange) {
      const updatedForm: Form = {
        ...form!,
        title: formConfig.title,
        description: formConfig.description,
        fields: formConfig.fields,
        updatedAt: new Date().toISOString(),
      };
      onChange(updatedForm);
    }
  }, [formConfig, form, onChange]);

  const handleFieldAdd = (type: FieldType) => {
    if (readOnly) return;
    
    const newField: FieldConfig = {
      id: `field-${fieldIdCounter++}`,
      type,
      label: `New ${type} field`,
      required: false,
      options: (type === 'select' || type === 'multiselect')
        ? [{ value: 'option1', label: 'Option 1' }]
        : undefined,
    };

    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<FieldConfig>) => {
    if (readOnly) return;

    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const handleFieldRemove = (fieldId: string) => {
    if (readOnly) return;

    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const handleDragStart = () => {
    // Implementation of handleDragStart
  };

  const handleDragEnd = () => {
    // Implementation of handleDragEnd
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-8">
        {/* Form Canvas */}
        <div className={`${readOnly ? 'col-span-12' : 'col-span-9'}`}>
          <div className="space-y-4">
            <Input
              type="text"
              value={formConfig.description}
              onChange={(e) => !readOnly && setFormConfig((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Form Description (optional)"
              className="bg-transparent"
              disabled={readOnly}
            />

            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <div className="space-y-6">
                <SortableContext
                  items={formConfig.fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {formConfig.fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      mode={readOnly ? 'display' : 'builder'}
                      onConfigChange={(updates) => !readOnly && handleFieldUpdate(field.id, updates)}
                      onRemove={() => !readOnly && handleFieldRemove(field.id)}
                    />
                  ))}
                </SortableContext>

                {formConfig.fields.length === 0 && !readOnly && (
                  <div className="rounded-lg border-2 border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Drag and drop fields here or select from the palette
                    </p>
                  </div>
                )}
              </div>
            </DndContext>
          </div>
        </div>

        {/* Field Palette */}
        {!readOnly && (
          <div className="col-span-3">
            <div className="sticky top-6">
              <FieldPalette onFieldSelect={handleFieldAdd} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 