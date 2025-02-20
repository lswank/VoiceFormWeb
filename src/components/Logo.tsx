import { type ReactElement } from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps): ReactElement {
  return (
    <div 
      className={`relative w-48 h-12 cursor-pointer overflow-hidden ${className}`}
    >
      <svg 
        className="w-full h-full"
        viewBox="0 0 500 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Voice */}
        <path
          d="M30,20 L45,80 L60,20 M80,50 C80,35 80,20 95,20 C110,20 110,35 110,50 C110,65 110,80 95,80 C80,80 80,65 80,50 M130,20 L130,80 M180,20 C150,20 150,35 150,50 C150,65 165,80 180,80 M190,20 L190,80 M190,20 L210,20 M190,50 L210,50 M190,80 L210,80"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw stroke-blue-500 dark:stroke-white"
        />
        {/* Form */}
        <path
          d="M240,20 L240,80 M240,20 L270,20 M240,50 L260,50 M290,50 C290,35 290,20 305,20 C320,20 320,35 320,50 C320,65 320,80 305,80 C290,80 290,65 290,50 M340,20 L340,80 M340,20 L360,20 C370,20 370,35 360,50 C365,50 380,80 380,80 M390,20 L390,80 M390,20 L405,50 L420,20 L420,80"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-delayed stroke-blue-500 dark:stroke-white"
        />
      </svg>
    </div>
  );
} 