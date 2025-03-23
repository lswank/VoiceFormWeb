import { useFeatures } from '../contexts/hooks/useFeatures';
import { Button } from '../components/Button';
import { Switch } from '../components/ui/switch';
import { 
  CubeTransparentIcon, 
  BeakerIcon, 
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface FeatureToggleProps {
  name: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ComponentType<React.ComponentProps<'svg'>>;
}

function FeatureToggle({ 
  name, 
  description, 
  enabled, 
  onChange, 
  icon: Icon 
}: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-x-3">
        {Icon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-secondary-900 dark:text-white">{name}</h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{description}</p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onChange={onChange}
      />
    </div>
  );
}

export function FeatureToggles() {
  const { features, setFeature, resetFeatures } = useFeatures();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-secondary-900 dark:text-white">Feature Toggles</h1>
          <p className="mt-2 text-sm text-secondary-700 dark:text-secondary-400">
            Enable or disable experimental features
          </p>
        </div>
        <Button variant="secondary" onClick={resetFeatures}>
          Reset to Defaults
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white">
            <div className="flex items-center gap-x-2">
              <CubeTransparentIcon className="h-5 w-5 text-primary-500 dark:text-primary-400" />
              <span>UI Features</span>
            </div>
          </h2>
          <div className="mt-4 divide-y divide-secondary-200 dark:divide-secondary-700">
            <FeatureToggle
              name="3D Parallax Effect"
              description="Enable the 3D hover effect on cards and buttons throughout the application"
              enabled={features.enableParallaxEffects}
              onChange={(enabled) => setFeature('enableParallaxEffects', enabled)}
              icon={SparklesIcon}
            />
            <FeatureToggle
              name="PDF Form Import"
              description="Import existing forms from PDF documents using OCR"
              enabled={features.enablePdfFormImport}
              onChange={(enabled) => setFeature('enablePdfFormImport', enabled)}
              icon={SparklesIcon}
            />
          </div>
        </div>
      </div>

      {/* Placeholder for future feature categories */}
      <div className="rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white">
            <div className="flex items-center gap-x-2">
              <BeakerIcon className="h-5 w-5 text-accent-purple-500 dark:text-accent-purple-400" />
              <span>Experimental Features</span>
            </div>
          </h2>
          <div className="mt-4 divide-y divide-secondary-200 dark:divide-secondary-700">
            <div className="py-4 text-sm text-secondary-500 dark:text-secondary-400 italic">
              No experimental features available yet
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white">
            <div className="flex items-center gap-x-2">
              <BoltIcon className="h-5 w-5 text-accent-amber-500 dark:text-accent-amber-400" />
              <span>Performance Features</span>
            </div>
          </h2>
          <div className="mt-4 divide-y divide-secondary-200 dark:divide-secondary-700">
            <div className="py-4 text-sm text-secondary-500 dark:text-secondary-400 italic">
              No performance features available yet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 