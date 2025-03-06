import { useState, ReactNode } from 'react';
import { FeatureContext, FeatureFlags, DEFAULT_FEATURES } from './FeatureContext';

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureFlags>(() => {
    // Try to load stored features
    const storedFeatures = localStorage.getItem('featureFlags');
    if (storedFeatures) {
      try {
        const parsed = JSON.parse(storedFeatures);
        return { ...DEFAULT_FEATURES, ...parsed };
      } catch (error) {
        console.error('Failed to parse stored feature flags', error);
      }
    }
    return DEFAULT_FEATURES;
  });

  const setFeature = (key: keyof FeatureFlags, value: boolean) => {
    setFeatures(prev => {
      const newFeatures = { ...prev, [key]: value };
      // Store in local storage
      localStorage.setItem('featureFlags', JSON.stringify(newFeatures));
      return newFeatures;
    });
  };

  const resetFeatures = () => {
    setFeatures(DEFAULT_FEATURES);
    localStorage.removeItem('featureFlags');
  };

  return (
    <FeatureContext.Provider value={{ features, setFeature, resetFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
} 