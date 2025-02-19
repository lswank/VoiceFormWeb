import { z } from 'zod';

// Field option schema
export const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Field type enum
export const fieldTypeSchema = z.enum([
  'text',
  'number',
  'email',
  'select',
  'multiselect',
  'date',
  'time',
  'voice',
  'phone',
  'textarea',
]);

// Field schema
export const fieldSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(fieldOptionSchema).optional(),
});

// Form status enum
export const formStatusSchema = z.enum(['draft', 'published', 'archived']);

// Form schema
export const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string(),
  status: formStatusSchema,
  responseCount: z.number().int().min(0),
  starred: z.boolean().optional(),
});

// Form response schema
export const formResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  data: z.record(z.string()),
  submittedAt: z.string().datetime(),
});

// Form analytics schema
export const formAnalyticsSchema = z.object({
  totalResponses: z.number().int().min(0),
  averageCompletionTime: z.number().min(0),
  completionRate: z.number().min(0).max(1),
  responseTimeline: z.array(
    z.object({
      date: z.string(),
      count: z.number().int().min(0),
    })
  ),
  fieldCompletion: z.array(
    z.object({
      fieldId: z.string(),
      completionRate: z.number().min(0).max(1),
    })
  ),
});

// Export types derived from schemas
export type FieldType = z.infer<typeof fieldTypeSchema>;
export type FieldOption = z.infer<typeof fieldOptionSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type FormStatus = z.infer<typeof formStatusSchema>;
export type Form = z.infer<typeof formSchema>;
export type FormResponse = z.infer<typeof formResponseSchema>;
export type FormAnalytics = z.infer<typeof formAnalyticsSchema>; 