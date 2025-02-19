import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Field, type FieldConfig } from '../components/form/Field';
import { Button } from '../components/Button';
import { MicrophoneIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { formService, type Form } from '../services/formService';
import { aiService } from '../services/aiService';
import { emailService } from '../services/emailService';

// Mock form data
const mockForm = {
  id: '1',
  title: 'Customer Feedback',
  description: 'Please share your thoughts about our service',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'Your Name',
      required: true,
      value: '',
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      value: '',
    },
    {
      id: 'feedback',
      type: 'textarea',
      label: 'Your Feedback',
      required: true,
      value: '',
      helpText: 'Please be as specific as possible',
    },
  ] as FieldConfig[],
};

interface ClarificationPrompt {
  fieldId: string;
  question: string;
  options?: string[];
}

function VoiceButton({ isRecording, onToggle }: { isRecording: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={twMerge(
        'relative inline-flex h-16 w-16 items-center justify-center rounded-full transition-colors',
        isRecording
          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800'
          : 'bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-400 dark:hover:bg-primary-800'
      )}
    >
      {isRecording ? (
        <>
          <PauseIcon className="h-8 w-8" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </>
      ) : (
        <MicrophoneIcon className="h-8 w-8" />
      )}
    </button>
  );
}

function TranscriptionDisplay({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800">
      <p className="text-sm text-secondary-600 dark:text-secondary-400">
        {text || 'Listening...'}
      </p>
    </div>
  );
}

function ClarificationPromptModal({
  prompt,
  onRespond,
  onCancel,
}: {
  prompt: ClarificationPrompt;
  onRespond: (response: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-secondary-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg font-medium leading-6 text-secondary-900 dark:text-white">
                {prompt.question}
              </h3>
              <div className="mt-4">
                {prompt.options ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {prompt.options.map((option) => (
                      <Button
                        key={option}
                        variant="secondary"
                        onClick={() => onRespond(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button onClick={() => onRespond('yes')}>Continue</Button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <Button variant="secondary" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RespondentInterfaceProps {
  form?: Form;
  isPreview?: boolean;
}

export function RespondentInterface({ form: propForm, isPreview = false }: RespondentInterfaceProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(propForm || null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [clarificationPrompt, setClarificationPrompt] = useState<ClarificationPrompt | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!propForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
    error: voiceError,
  } = useVoiceInput({
    onError: (error) => {
      console.error('Voice input error:', error);
      setError(error);
    },
  });

  // Fetch form data if not in preview mode
  useEffect(() => {
    const fetchForm = async () => {
      if (!id || isPreview) return;

      try {
        const data = await formService.getForm(id);
        setForm(data);
        // Initialize form data with empty values
        const initialData = data.fields.reduce(
          (acc, field) => ({ ...acc, [field.id]: '' }),
          {}
        );
        setFormData(initialData);
      } catch (err) {
        setError('Failed to load form. Please try again later.');
        console.error('Error fetching form:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id, isPreview]);

  // Initialize form data when form is provided (preview mode)
  useEffect(() => {
    if (propForm) {
      const initialData = propForm.fields.reduce(
        (acc, field) => ({ ...acc, [field.id]: '' }),
        {}
      );
      setFormData(initialData);
    }
  }, [propForm]);

  // Process transcript with AI
  useEffect(() => {
    if (!transcript || !form || isProcessing) return;

    const processTranscript = async () => {
      setIsProcessing(true);
      try {
        const result = await aiService.processVoiceInput(
          transcript,
          form.fields,
          formData
        );

        // Update form data with AI-processed values
        setFormData((prev) => ({
          ...prev,
          ...result.fieldValues,
        }));

        // Handle clarification if needed
        if (result.needsClarification && result.clarificationPrompt) {
          setClarificationPrompt(result.clarificationPrompt);
          stopRecording();
        }

        // If confidence is low, maybe ask for confirmation
        if (result.confidence < 0.7) {
          // TODO: Implement confidence-based confirmation
          console.log('Low confidence in AI processing:', result.confidence);
        }
      } catch (err) {
        console.error('Error processing voice input:', err);
        setError('Failed to process voice input. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    processTranscript();
  }, [transcript, form, formData, isProcessing, stopRecording]);

  const handleToggleRecording = () => {
    if (clarificationPrompt) return;
    if (isRecording) {
      stopRecording();
    } else {
      setError(null);
      startRecording();
    }
  };

  const handleClarificationResponse = async (response: string) => {
    if (!clarificationPrompt || !form) return;

    try {
      // Validate the clarified response
      const validation = await aiService.validateResponse(
        form.fields.find((f) => f.id === clarificationPrompt.fieldId)!,
        response
      );

      if (validation.isValid) {
        // Update the field with the validated response
        setFormData((prev) => ({
          ...prev,
          [clarificationPrompt.fieldId]: response,
        }));
      } else if (validation.suggestion) {
        // If there's a suggestion, update with that
        setFormData((prev) => ({
          ...prev,
          [clarificationPrompt.fieldId]: validation.suggestion!,
        }));
      } else {
        // Show error but keep the prompt open
        setError(validation.error || 'Invalid response');
        return;
      }

      // Clear the prompt and continue
      setClarificationPrompt(null);
      resetTranscript();
    } catch (err) {
      console.error('Error validating response:', err);
      setError('Failed to validate response. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!id || !form || isPreview) return;

    setIsSubmitting(true);
    try {
      // Submit form response
      const response = await formService.submitFormResponse(id, formData);

      // Send confirmation email if email field exists
      const emailField = form.fields.find(
        (f) => f.type === 'email' || f.id.toLowerCase().includes('email')
      );
      if (emailField && formData[emailField.id]) {
        try {
          await emailService.sendFormSubmissionConfirmation(
            formData[emailField.id],
            form,
            response
          );
        } catch (err) {
          // Log error but don't block submission
          console.error('Failed to send confirmation email:', err);
        }
      }

      // Send notification to form owner
      try {
        await emailService.sendFormResponseNotification(form, response);
      } catch (err) {
        // Log error but don't block submission
        console.error('Failed to send notification email:', err);
      }

      // Show success message and redirect
      navigate(`/forms/${id}/success`);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
          <p className="text-sm text-red-700 dark:text-red-200">
            {error || 'Failed to load form.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Form Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
          {form.title}
        </h1>
        {form.description && (
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            {form.description}
          </p>
        )}
        {isPreview && (
          <div className="mt-2 rounded-md bg-secondary-50 p-2 dark:bg-secondary-800">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Preview Mode - Try the voice input feature!
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-8">
        {/* Voice Controls */}
        <div className="flex justify-center">
          <VoiceButton
            isRecording={isRecording}
            onToggle={handleToggleRecording}
          />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-500 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          </div>
        )}

        {/* Voice Error */}
        {(voiceError || error) && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
            <p className="text-sm text-red-700 dark:text-red-200">
              {voiceError || error}
            </p>
          </div>
        )}

        {/* Transcription Display */}
        <TranscriptionDisplay text={transcript} />

        {/* Form Fields */}
        <div className="space-y-6">
          {form.fields.map((field) => (
            <Field
              key={field.id}
              config={{
                ...field,
                value: formData[field.id] || '',
              }}
              mode={isReviewing ? 'edit' : 'display'}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.id]: value,
                }))
              }
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {isReviewing ? (
            <>
              <Button variant="secondary" onClick={() => setIsReviewing(false)}>
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                Start Over
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || isPreview}
              >
                {isPreview ? 'Preview Mode' : isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsReviewing(true)}>Review</Button>
          )}
        </div>
      </div>

      {/* Clarification Modal */}
      {clarificationPrompt && (
        <ClarificationPromptModal
          prompt={clarificationPrompt}
          onRespond={handleClarificationResponse}
          onCancel={() => setClarificationPrompt(null)}
        />
      )}
    </div>
  );
} 