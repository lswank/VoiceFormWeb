import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';

function PhoneNumberInput({ onSubmit }: { onSubmit: (phoneNumber: string) => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    onSubmit(phoneNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-secondary-900 dark:text-white"
        >
          Phone Number
        </label>
        <div className="mt-2">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            error={error}
          />
        </div>
      </div>

      <Button type="submit" fullWidth>
        Send Code
      </Button>
    </form>
  );
}

function OTPInput({ onSubmit }: { onSubmit: (otp: string) => void }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic OTP validation
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-secondary-900 dark:text-white"
        >
          Verification Code
        </label>
        <div className="mt-2">
          <Input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            error={error}
          />
        </div>
      </div>

      <Button type="submit" fullWidth>
        Verify
      </Button>
    </form>
  );
}

export function PhoneLogin() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePhoneSubmit = async (phone: string) => {
    // TODO: Implement sending OTP
    console.log('Sending OTP to:', phone);
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPSubmit = async (otp: string) => {
    try {
      // TODO: Implement OTP verification
      console.log('Verifying OTP:', otp, 'for phone:', phoneNumber);
      await login();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-secondary-900 dark:text-white">
          Sign in with Phone
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {step === 'phone' ? (
          <PhoneNumberInput onSubmit={handlePhoneSubmit} />
        ) : (
          <OTPInput onSubmit={handleOTPSubmit} />
        )}

        <p className="mt-10 text-center text-sm text-secondary-500 dark:text-secondary-400">
          Or{' '}
          <Link
            to="/login"
            className="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            sign in with email
          </Link>
        </p>
      </div>
    </div>
  );
} 