export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'time'
  | 'voice'
  | 'phone'
  | 'textarea';

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
}

export type FormStatus = 'draft' | 'published' | 'archived';

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: FormStatus;
  responseCount: number;
  starred?: boolean;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, string>;
  submittedAt: string;
}

export interface FormAnalytics {
  totalResponses: number;
  averageCompletionTime: number; // in seconds
  completionRate: number; // 0 to 1
  responseTimeline: Array<{
    date: string;
    count: number;
  }>;
  fieldCompletion: Array<{
    fieldId: string;
    completionRate: number;
  }>;
} 