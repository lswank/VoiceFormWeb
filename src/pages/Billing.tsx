import { useState, useRef, Fragment } from 'react';
import { Button } from '../components/Button';
import {
  CreditCardIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { Dialog, Transition } from '@headlessui/react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface Plan {
  id: string;
  name: string;
  price: number | null;
  yearlyPrice: number | null;
  seats: number;
  additionalSeatPrice?: number;
  features: string[];
  limits: {
    forms: number;
    responses: number;
    storage: number;
  };
}

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  expMonth: number;
  expYear: number;
  brand: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    yearlyPrice: 0,
    seats: 1,
    features: [
      '1 form',
      '10 responses/month',
      'Basic form builder',
      'Voice input support',
      'Email notifications',
    ],
    limits: {
      forms: 1,
      responses: 10,
      storage: 100,
    },
  },
  {
    id: 'small-business',
    name: 'Small Business',
    price: 29,
    yearlyPrice: 300,
    seats: 1,
    features: [
      'Up to 3 forms',
      '100 responses/month',
      'Add your logo',
      'Basic analytics',
      'Priority email support',
      'Export responses',
    ],
    limits: {
      forms: 3,
      responses: 100,
      storage: 500,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    yearlyPrice: 1000,
    seats: 3,
    additionalSeatPrice: 5,
    features: [
      'Unlimited forms',
      '10,000 responses/month',
      'Full custom branding',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Team collaboration',
    ],
    limits: {
      forms: Infinity,
      responses: 10000,
      storage: 10000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    yearlyPrice: null,
    seats: 10,
    features: [
      'Generous, usage-based pricing',
      'Unlimited everything',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Security review',
      'Custom features',
    ],
    limits: {
      forms: Infinity,
      responses: Infinity,
      storage: Infinity,
    },
  },
];

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentMethodModal({ open, onClose, onSuccess }: PaymentMethodModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred');
        return;
      }

      // TODO: Send paymentMethod.id to your backend
      console.log('Payment Method:', paymentMethod);
      
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to process payment method. Please try again.');
      console.error('Payment method error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity dark:bg-secondary-900 dark:bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-secondary-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-secondary-500 dark:hover:text-secondary-400"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-secondary-900 dark:text-white">
                      Add Payment Method
                    </Dialog.Title>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="rounded-md border border-secondary-300 p-4 shadow-sm dark:border-secondary-600">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#1F2937',
                                  '::placeholder': {
                                    color: '#6B7280',
                                  },
                                },
                              },
                              hidePostalCode: true,
                            }}
                          />
                        </div>
                        
                        {error && (
                          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <p className="text-sm text-red-800 dark:text-red-200">
                              {error}
                            </p>
                          </div>
                        )}

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <Button
                            type="submit"
                            disabled={!stripe || isProcessing}
                            className="w-full sm:ml-3 sm:w-auto"
                          >
                            {isProcessing ? 'Processing...' : 'Add Payment Method'}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="mt-3 w-full sm:mt-0 sm:w-auto"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function Billing() {
  const [currentPlan, setCurrentPlan] = useState<Plan>(plans[0]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      expMonth: 12,
      expYear: 2024,
      brand: 'visa',
      isDefault: true,
    },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv_1',
      date: '2024-01-01',
      amount: 29,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'inv_2',
      date: '2024-02-01',
      amount: 29,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'inv_3',
      date: '2024-03-01',
      amount: 29,
      status: 'paid',
      downloadUrl: '#',
    }
  ]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const plansRef = useRef<HTMLDivElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const usage = {
    forms: 2,
    responses: 75,
    storage: 50,
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(m => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handlePlanChange = (plan: Plan) => {
    // TODO: Implement plan change
    console.log('Changing to plan:', plan.name);
    setCurrentPlan(plan);
  };

  const handleUpgradeClick = () => {
    setIsChangingPlan(true);
    // Wait for next tick to ensure isChangingPlan is set
    setTimeout(() => {
      plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    // TODO: Refresh payment methods list
    console.log('Payment method added successfully');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900 dark:text-white">
          Billing
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
            Current Plan: {currentPlan.name}
          </h3>
          
          {/* Warning Box for Exceeded Limits */}
          {(usage.forms > currentPlan.limits.forms || 
            usage.responses > currentPlan.limits.responses ||
            usage.storage > currentPlan.limits.storage) && (
            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Soft limits exceeded
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>
                      You've exceeded one or more of your plan limits. Please upgrade your plan to ensure uninterrupted service.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        onClick={handleUpgradeClick}
                        className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60 dark:focus:ring-offset-secondary-900"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Forms Used
              </h4>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    {usage.forms} / {currentPlan.limits.forms === Infinity ? '∞' : currentPlan.limits.forms}
                  </span>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {Math.round((usage.forms / currentPlan.limits.forms) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{
                      width: `${Math.min(
                        (usage.forms / currentPlan.limits.forms) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Monthly Responses
              </h4>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    {usage.responses} / {currentPlan.limits.responses === Infinity ? '∞' : currentPlan.limits.responses}
                  </span>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {Math.round((usage.responses / currentPlan.limits.responses) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{
                      width: `${Math.min(
                        (usage.responses / currentPlan.limits.responses) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Storage Used
              </h4>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    {usage.storage}MB / {currentPlan.limits.storage === Infinity ? '∞' : `${currentPlan.limits.storage}MB`}
                  </span>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {Math.round((usage.storage / currentPlan.limits.storage) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{
                      width: `${Math.min(
                        (usage.storage / currentPlan.limits.storage) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div ref={plansRef} className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              Available Plans
            </h3>
            <div className="inline-flex rounded-lg bg-secondary-100 p-1 dark:bg-secondary-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={twMerge(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  billingCycle === 'monthly'
                    ? 'bg-white text-secondary-900 shadow dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white'
                )}
              >
                MONTHLY
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={twMerge(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  billingCycle === 'yearly'
                    ? 'bg-white text-secondary-900 shadow dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white'
                )}
              >
                YEARLY
              </button>
            </div>
          </div>

          {/* Current Plan Summary (Collapsed View) */}
          <div className="mt-6 rounded-lg border border-secondary-200 p-6 dark:border-secondary-700">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-medium text-secondary-900 dark:text-white">
                  {currentPlan.name}
                </h4>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {currentPlan.price === null ? 'Contact Us' : `$${billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.price}`}
                  </span>
                  {currentPlan.price !== null && (
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                  {billingCycle === 'yearly' && currentPlan.price !== null && currentPlan.yearlyPrice !== null && (
                    <div className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                      Save ${Math.round(currentPlan.price * 12 - currentPlan.yearlyPrice)} per year
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                  {currentPlan.seats === 1 ? '1 user included' : `${currentPlan.seats} users included`}
                  {currentPlan.additionalSeatPrice && (
                    <div className="text-xs">
                      +${currentPlan.additionalSeatPrice}/user/month
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                  <div>
                    <div className="font-medium text-secondary-900 dark:text-white">Forms & Responses</div>
                    <div className="mt-1">
                      {currentPlan.limits.forms === Infinity ? 'Unlimited forms' : `${currentPlan.limits.forms} forms`}
                      <br />
                      {currentPlan.limits.responses === Infinity ? 'Unlimited responses' : `${currentPlan.limits.responses} responses/mo`}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900 dark:text-white">Features</div>
                    <div className="mt-1">
                      Form builder & Voice input
                      <br />
                      {currentPlan.id === 'starter' && 'Basic analytics'}
                      {currentPlan.id === 'small-business' && 'Basic analytics + Export'}
                      {currentPlan.id === 'professional' && 'Advanced analytics'}
                      {currentPlan.id === 'enterprise' && 'Custom analytics'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {billingCycle === 'monthly' && currentPlan.price !== null && currentPlan.yearlyPrice !== null && (
                  <div className="flex flex-col items-end">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Switch to Yearly
                    </button>
                    {Math.round(currentPlan.price * 12 - currentPlan.yearlyPrice) > 0 && (
                      <div className="text-xs text-primary-600 dark:text-primary-400">
                        Save ${Math.round(currentPlan.price * 12 - currentPlan.yearlyPrice)} per year
                      </div>
                    )}
                  </div>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setIsChangingPlan(true)}
                >
                  Change Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Full Plan Comparison (Expanded View) */}
          {isChangingPlan && (
            <div className="mt-6">
              <div className="mb-4 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setIsChangingPlan(false)}
                >
                  Cancel
                </Button>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                  <thead>
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="col" className="py-4 pl-4 pr-6 text-left text-sm font-medium text-secondary-500 dark:text-secondary-400">
                        Features
                      </th>
                      {plans.map((plan) => (
                        <th key={plan.id} scope="col" className="px-4 py-4 text-center">
                          <div className={twMerge(
                            'rounded-lg px-2 py-3',
                            currentPlan.id === plan.id
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : ''
                          )}>
                            <div className="text-base font-medium text-secondary-900 dark:text-white">{plan.name}</div>
                            <div className="mt-1">
                              <span className="text-2xl font-bold text-secondary-900 dark:text-white">
                                {plan.price === null ? 'Contact Us' : `$${billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}`}
                              </span>
                              {plan.price !== null && (
                                <span className="text-sm text-secondary-500 dark:text-secondary-400">
                                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                                </span>
                              )}
                            </div>
                            {billingCycle === 'yearly' && plan.price !== null && plan.yearlyPrice !== null && (
                              <div className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                                Save ${Math.round(plan.price * 12 - plan.yearlyPrice)} per year
                              </div>
                            )}
                            <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                              {plan.seats === 1 ? '1 user included' : `${plan.seats} users included`}
                              {plan.additionalSeatPrice && (
                                <div className="text-xs">
                                  +${plan.additionalSeatPrice}/user/month
                                </div>
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="row" className="py-3 pl-4 pr-6 text-left text-sm font-medium text-secondary-900 dark:text-white">
                        Forms & Responses
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-secondary-500 dark:text-secondary-400">
                          {plan.limits.forms === Infinity ? 'Unlimited forms' : `${plan.limits.forms} forms`}
                          <br />
                          {plan.limits.responses === Infinity ? 'Unlimited responses' : `${plan.limits.responses} responses/mo`}
                        </td>
                      ))}
                    </tr>
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="row" className="py-3 pl-4 pr-6 text-left text-sm font-medium text-secondary-900 dark:text-white">
                        Form Building
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-secondary-500 dark:text-secondary-400">
                          Form builder
                          <br />
                          Voice input
                        </td>
                      ))}
                    </tr>
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="row" className="py-3 pl-4 pr-6 text-left text-sm font-medium text-secondary-900 dark:text-white">
                        Analytics & Reporting
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-secondary-500 dark:text-secondary-400">
                          {plan.id === 'starter' && 'Basic analytics'}
                          {plan.id === 'small-business' && 'Basic analytics + Export'}
                          {plan.id === 'professional' && 'Advanced analytics + Export'}
                          {plan.id === 'enterprise' && 'Custom analytics & reporting'}
                        </td>
                      ))}
                    </tr>
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="row" className="py-3 pl-4 pr-6 text-left text-sm font-medium text-secondary-900 dark:text-white">
                        Customization
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-secondary-500 dark:text-secondary-400">
                          {plan.id === 'starter' && '—'}
                          {plan.id === 'small-business' && 'Add your logo'}
                          {plan.id === 'professional' && 'Full branding customization'}
                          {plan.id === 'enterprise' && 'Custom branding & white-label'}
                        </td>
                      ))}
                    </tr>
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="row" className="py-3 pl-4 pr-6 text-left text-sm font-medium text-secondary-900 dark:text-white">
                        Support & Team
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-secondary-500 dark:text-secondary-400">
                          {plan.id === 'starter' && 'Email support'}
                          {plan.id === 'small-business' && 'Priority email support'}
                          {plan.id === 'professional' && 'Priority support + Team features'}
                          {plan.id === 'enterprise' && 'Dedicated support + SLA'}
                        </td>
                      ))}
                    </tr>
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <th scope="row" className="py-3 pl-4 pr-6 text-left text-sm font-medium text-secondary-900 dark:text-white">
                        Advanced Features
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-secondary-500 dark:text-secondary-400">
                          {plan.id === 'starter' && '—'}
                          {plan.id === 'small-business' && '—'}
                          {plan.id === 'professional' && 'API access'}
                          {plan.id === 'enterprise' && 'API access + Custom integrations'}
                        </td>
                      ))}
                    </tr>
                    {/* Action row */}
                    <tr className="divide-x divide-secondary-200 dark:divide-secondary-700">
                      <td className="py-4 pl-4 pr-6" />
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-4 text-center">
                          <Button
                            variant={currentPlan.id === plan.id ? 'primary' : 'secondary'}
                            size="sm"
                            fullWidth
                            disabled={currentPlan.id === plan.id}
                            onClick={() => handlePlanChange(plan)}
                          >
                            {currentPlan.id === plan.id 
                              ? 'Current Plan' 
                              : plan.price === null 
                                ? 'Contact Us'
                                : 'Upgrade'
                            }
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              Payment Methods
            </h3>
            <Button 
              variant="secondary" 
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Payment Method
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border border-secondary-200 p-4 dark:border-secondary-700"
              >
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="h-8 w-8 text-secondary-400" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white">
                      {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in {method.last4}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="secondary"
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
            Billing History
          </h3>
          <div className="mt-4 space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-secondary-200 p-4 dark:border-secondary-700"
              >
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-8 w-8 text-secondary-400" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white">
                      ${invoice.amount.toFixed(2)} - {new Date(invoice.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => window.open(invoice.downloadUrl, '_blank')}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PaymentMethodModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
} 