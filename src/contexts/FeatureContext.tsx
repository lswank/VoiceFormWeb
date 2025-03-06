import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FeatureFlags {
  enableParallax: boolean;
  // Add more feature flags here as needed
}

const defaultFeatures: FeatureFlags = {
  enableParallax: true,
};

interface FeatureContextType {
  features: FeatureFlags;
  setFeature: (key: keyof FeatureFlags, value: boolean) => void;
  resetFeatures: () => void;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureFlags>(defaultFeatures);

  // Load features from localStorage on mount
  useEffect(() => {
    const savedFeatures = localStorage.getItem('featureFlags');
    if (savedFeatures) {
      try {
        const parsedFeatures = JSON.parse(savedFeatures);
        setFeatures(prev => ({ ...prev, ...parsedFeatures }));
      } catch (error) {
        console.error('Failed to parse feature flags from localStorage:', error);
      }
    }
  }, []);

  // Update a single feature
  const setFeature = (key: keyof FeatureFlags, value: boolean) => {
    setFeatures(prev => {
      const newFeatures = { ...prev, [key]: value };
      // Save to localStorage
      localStorage.setItem('featureFlags', JSON.stringify(newFeatures));
      return newFeatures;
    });
  };

  // Reset all features to defaults
  const resetFeatures = () => {
    setFeatures(defaultFeatures);
    localStorage.setItem('featureFlags', JSON.stringify(defaultFeatures));
  };

  return (
    <FeatureContext.Provider value={{ features, setFeature, resetFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
} 