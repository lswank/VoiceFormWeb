import { z } from 'zod';
import api from './index';

// Define email preferences type
export interface EmailPreferences {
  userId?: string;
  formSubmissionNotifications: boolean;
  responseNotifications: boolean;
  marketingEmails: boolean;
}

// Define Zod schema for validation
const emailPreferencesSchema = z.object({
  userId: z.string().uuid().optional(),
  formSubmissionNotifications: z.boolean(),
  responseNotifications: z.boolean(),
  marketingEmails: z.boolean()
});

// Email API methods
export const emailApi = {
  /**
   * Send form submission confirmation email
   */
  sendSubmissionConfirmation: (responseId: string, email: string, formId?: string) => 
    api.post<{ success: boolean }>(
      '/email/submission-confirmation', 
      { responseId, email, formId },
      z.object({ success: z.boolean() })
    ),
  
  /**
   * Send form response notification email
   */
  sendResponseNotification: (responseId: string, formId: string) => 
    api.post<{ success: boolean }>(
      '/email/response-notification', 
      { responseId, formId },
      z.object({ success: z.boolean() })
    ),
  
  /**
   * Update email notification preferences
   */
  updateEmailPreferences: (preferences: EmailPreferences) => 
    api.put<EmailPreferences>('/email/preferences', preferences, emailPreferencesSchema),
  
  /**
   * Get email notification preferences for a user
   */
  getEmailPreferences: (userId: string) => 
    api.get<EmailPreferences>(`/email/preferences/${userId}`, emailPreferencesSchema),
  
  /**
   * Unsubscribe from email notifications
   */
  unsubscribeEmails: (
    token: string, 
    userId?: string, 
    type?: 'all' | 'marketing' | 'formSubmission' | 'responseNotification'
  ) => 
    api.post<{ success: boolean }>(
      '/email/unsubscribe', 
      { token, userId, type },
      z.object({ success: z.boolean() })
    )
};

export default emailApi;