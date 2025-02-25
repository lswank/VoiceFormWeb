import { useState, useCallback, ReactNode, ElementType } from 'react';
import { useFeatures } from '../contexts/FeatureContext';

interface Position {
  x: number;
  y: number;
}

interface Hoverable3DProps<T extends ElementType = 'div'> {
  children: ReactNode;
  className?: string;
  intensity?: 'small' | 'medium' | 'large';
  shadowOpacity?: number;
  as?: T;
  [key: string]: any; // For additional props passed to the element
}

export function Hoverable3D<T extends ElementType = 'div'>({ 
  children, 
  className = '', 
  intensity = 'medium',
  shadowOpacity = 0.1,
  as,
  ...props 
}: Hoverable3DProps<T>) {
  const { features } = useFeatures();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<Position>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // If parallax is disabled, render without effects
  if (!features.enableParallax) {
    const Component = as || 'div';
    return (
      <Component {...props} className={`relative block ${className}`}>
        {children}
      </Component>
    );
  }

  // Scale the effect based on intensity
  const intensityMap = {
    small: { rotate: 2, move: 4, lift: 10 },
    medium: { rotate: 4, move: 8, lift: 20 },
    large: { rotate: 6, move: 12, lift: 30 },
  };

  const { rotate, move, lift } = intensityMap[intensity];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isHovering) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * rotate;
    const rotateY = ((x - centerX) / centerX) * rotate;
    const moveX = ((x - centerX) / centerX) * move;
    const moveY = ((y - centerY) / centerY) * move;
    
    setRotation({ x: rotateX, y: -rotateY });
    setPosition({ x: moveX, y: moveY });
  }, [isHovering, rotate, move]);

  const Component = as || 'div';

  return (
    <div className="relative">
      {/* Shadow element that moves opposite to the content */}
      <div 
        className={`absolute inset-0 rounded-lg bg-black transition-all duration-200 ease-out blur-lg ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate3d(${-position.x * 2}px, ${-position.y * 2}px, 0)`,
          opacity: shadowOpacity,
        }}
      />
      
      <Component
        {...props}
        className={`relative block ${className}`}
        style={{
          transform: isHovering
            ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translate3d(${position.x}px, ${position.y}px, ${lift}px)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',
          transition: 'transform 0.2s ease-out',
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setPosition({ x: 0, y: 0 });
          setRotation({ x: 0, y: 0 });
        }}
        onMouseMove={handleMouseMove}
      >
        {children}
      </Component>
    </div>
  );
} 