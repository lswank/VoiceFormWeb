import { useState, useEffect } from 'react';
import type { Form, FormAnalytics } from '../schemas/form';
import { formService } from '../services/formService';
import { ValidationError } from '../utils/validation';

export function useForm(formId: string | undefined) {
  const [form, setForm] = useState<Form | null>(null);
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!formId) {
        setError('No form ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const [formData, analyticsData] = await Promise.all([
          formService.getForm(formId),
          formService.getFormAnalytics(formId),
        ]);

        setForm(formData);
        setAnalytics(analyticsData);
        setError(null);
      } catch (err) {
        if (err instanceof ValidationError) {
          setError('Invalid data received from server. Please contact support.');
          console.error('Validation error:', err.errors);
        } else {
          setError('Failed to load form data. Please try again later.');
          console.error('Error fetching form data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchData();
  }, [formId]);

  const mutate = (updatedForm: Form) => {
    setForm(updatedForm);
  };

  return { form, analytics, error, isLoading, mutate };
} 