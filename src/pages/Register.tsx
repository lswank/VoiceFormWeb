import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SSOButton } from '../components/SSOButton';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export function Register() {
  const { loginWithSSO } = useAuth();
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    organizationName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration
    console.log('Registration data:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
            Start creating voice-enabled forms in minutes
          </p>
        </div>

        <div className="space-y-6">
          {/* SSO Buttons */}
          <div className="space-y-3">
            <SSOButton
              provider="google"
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              }
              onClick={() => loginWithSSO('google')}
            >
              Google
            </SSOButton>
            
            <SSOButton
              provider="microsoft"
              icon={
                <svg className="h-5 w-5" viewBox="0 0 23 23">
                  <path fill="#f25022" d="M1 1h9v9H1z"/>
                  <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                  <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                  <path fill="#ffb900" d="M11 11h9v9h-9z"/>
                </svg>
              }
              onClick={() => loginWithSSO('microsoft')}
            >
              Microsoft
            </SSOButton>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300 dark:border-secondary-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-secondary-50 px-2 text-secondary-500 dark:bg-secondary-900 dark:text-secondary-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Full name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Work email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                label="Organization name"
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              By signing up, you agree to our{' '}
              <a href="/terms" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Privacy Policy
              </a>
            </div>

            <Button type="submit" fullWidth>
              Create account
              <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="text-center text-sm">
          <span className="text-secondary-500 dark:text-secondary-400">
            Already have an account?{' '}
          </span>
          <a href="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
} 