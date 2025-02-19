// Type declarations for environment variables
declare global {
  interface ImportMetaEnv {
    VITE_ENVIRONMENT?: 'local-ui' | 'local-dev' | 'staging' | 'production';
    VITE_API_URL?: string;
    MODE: 'development' | 'production';
  }
}

export type Environment = 'local-ui' | 'local-dev' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  apiUrl: string;
  brand: {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  auth: {
    providers: {
      google: boolean;
      microsoft: boolean;
      phone: boolean;
    };
  };
  features: {
    aiProcessing: boolean;
    emailNotifications: boolean;
    analytics: boolean;
  };
}

// Default brand configuration
const defaultBrand = {
  name: 'VoiceForm',
  logo: '/logo.svg',
  primaryColor: '#6366F1', // indigo-600
  secondaryColor: '#4B5563', // gray-600
};

// Environment-specific configurations
const configs: Record<Environment, AppConfig> = {
  'local-ui': {
    environment: 'local-ui',
    apiUrl: '',
    brand: defaultBrand,
    auth: {
      providers: {
        google: true,
        microsoft: true,
        phone: true,
      },
    },
    features: {
      aiProcessing: true,
      emailNotifications: true,
      analytics: true,
    },
  },
  'local-dev': {
    environment: 'local-dev',
    apiUrl: 'http://localhost:3001',
    brand: defaultBrand,
    auth: {
      providers: {
        google: true,
        microsoft: true,
        phone: true,
      },
    },
    features: {
      aiProcessing: true,
      emailNotifications: true,
      analytics: true,
    },
  },
  staging: {
    environment: 'staging',
    apiUrl: 'https://staging-api.voiceform.app',
    brand: defaultBrand,
    auth: {
      providers: {
        google: true,
        microsoft: true,
        phone: true,
      },
    },
    features: {
      aiProcessing: true,
      emailNotifications: true,
      analytics: true,
    },
  },
  production: {
    environment: 'production',
    apiUrl: 'https://api.voiceform.app',
    brand: defaultBrand,
    auth: {
      providers: {
        google: true,
        microsoft: true,
        phone: true,
      },
    },
    features: {
      aiProcessing: true,
      emailNotifications: true,
      analytics: true,
    },
  },
};

// Determine the current environment
function getCurrentEnvironment(): Environment {
  // Check for explicit environment variable
  const envFromVar = import.meta.env.VITE_ENVIRONMENT as Environment;
  if (envFromVar && envFromVar in configs) {
    return envFromVar;
  }

  // Check the hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check if we're running against a local backend
    return import.meta.env.VITE_API_URL ? 'local-dev' : 'local-ui';
  }
  if (hostname.includes('staging')) {
    return 'staging';
  }
  
  return 'production';
}

// Export the current configuration
export const config = configs[getCurrentEnvironment()]; 