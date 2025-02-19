import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement password reset
      console.log('Sending password reset email to:', email);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset failed:', err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon
              className="h-6 w-6 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-secondary-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
            We've sent a password reset link to{' '}
            <span className="font-medium text-secondary-900 dark:text-white">
              {email}
            </span>
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Click here to try again
            </button>
          </p>

          <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
            Or{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              return to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-secondary-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-secondary-900 dark:text-white"
            >
              Email address
            </label>
            <div className="mt-2">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />
            </div>
          </div>

          <Button type="submit" fullWidth>
            Send reset link
          </Button>
        </form>

        <p className="mt-10 text-center text-sm text-secondary-500 dark:text-secondary-400">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 