import { createContext } from 'react';

export interface FeatureFlags {
  enableParallax: boolean;
  // Add more feature flags here as needed
}

export const DEFAULT_FEATURES: FeatureFlags = {
  enableParallax: true,
};

export interface FeatureContextType {
  features: FeatureFlags;
  setFeature: (key: keyof FeatureFlags, value: boolean) => void;
  resetFeatures: () => void;
}

export const FeatureContext = createContext<FeatureContextType | undefined>(undefined); 