import type { Form, FormResponse } from '../schemas/form';
import { config } from '../config';

export interface EmailTemplate {
  subject: string;
  body: string;
}

// Mock email preferences storage for local-ui mode
const mockPreferences: Record<string, {
  receiveNewResponses: boolean;
  receiveDailyDigest: boolean;
  receiveWeeklyReport: boolean;
}> = {};

class EmailService {
  async sendFormSubmissionConfirmation(
    email: string,
    form: Form,
    response: FormResponse
  ): Promise<void> {
    if (config.environment === 'local-ui') {
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Mock email sent:', {
        to: email,
        subject: `Thank you for completing ${form.title}`,
        form,
        response,
      });
      return;
    }

    const emailResponse = await fetch(`${config.apiUrl}/email/submission-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        form,
        response,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send submission confirmation email');
    }
  }

  async sendFormResponseNotification(
    form: Form,
    response: FormResponse
  ): Promise<void> {
    if (config.environment === 'local-ui') {
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Mock notification sent:', {
        subject: `New response for ${form.title}`,
        form,
        response,
      });
      return;
    }

    const emailResponse = await fetch(`${config.apiUrl}/email/response-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form,
        response,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send response notification email');
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      receiveNewResponses: boolean;
      receiveDailyDigest: boolean;
      receiveWeeklyReport: boolean;
    }
  ): Promise<void> {
    if (config.environment === 'local-ui') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      mockPreferences[userId] = preferences;
      return;
    }

    const response = await fetch(`${config.apiUrl}/email/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }
  }

  async getNotificationPreferences(
    userId: string
  ): Promise<{
    receiveNewResponses: boolean;
    receiveDailyDigest: boolean;
    receiveWeeklyReport: boolean;
  }> {
    if (config.environment === 'local-ui') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPreferences[userId] || {
        receiveNewResponses: true,
        receiveDailyDigest: true,
        receiveWeeklyReport: true,
      };
    }

    const response = await fetch(`${config.apiUrl}/email/preferences/${userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }

    return response.json();
  }

  async unsubscribe(
    userId: string,
    type: 'all' | 'new-responses' | 'daily-digest' | 'weekly-report'
  ): Promise<void> {
    if (config.environment === 'local-ui') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const currentPrefs = mockPreferences[userId] || {
        receiveNewResponses: true,
        receiveDailyDigest: true,
        receiveWeeklyReport: true,
      };

      if (type === 'all') {
        mockPreferences[userId] = {
          receiveNewResponses: false,
          receiveDailyDigest: false,
          receiveWeeklyReport: false,
        };
      } else {
        mockPreferences[userId] = {
          ...currentPrefs,
          [type === 'new-responses' ? 'receiveNewResponses' :
           type === 'daily-digest' ? 'receiveDailyDigest' :
           'receiveWeeklyReport']: false,
        };
      }
      return;
    }

    const response = await fetch(`${config.apiUrl}/email/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to unsubscribe from notifications');
    }
  }
}

export const emailService = new EmailService(); 