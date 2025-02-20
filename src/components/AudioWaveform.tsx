import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface AudioWaveformProps {
  isRecording: boolean;
  className?: string;
}

export function AudioWaveform({ isRecording, className }: AudioWaveformProps) {
  const [time, setTime] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    const animate = () => {
      setTime(t => (t + 1) % 100);
      frameRef.current = requestAnimationFrame(animate);
    };
    
    if (isRecording) {
      frameRef.current = requestAnimationFrame(animate);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRecording]);

  // Just 5 bars for testing visibility
  const bars = [0, 1, 2, 3, 4];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex gap-1">
        {bars.map((i) => {
          const height = 20 + Math.sin((time + i * 10) / 10) * 20;
          return (
            <div
              key={i}
              className="w-2 bg-red-500"
              style={{
                height: isRecording ? `${height}px` : '0px',
                transition: 'height 150ms ease-in-out',
              }}
            />
          );
        })}
      </div>
    </div>
  );
} 