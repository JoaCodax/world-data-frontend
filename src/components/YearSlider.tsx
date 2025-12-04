import { useState, useEffect, useRef, useCallback } from 'react';
import { Range, getTrackBackground } from 'react-range';

interface YearSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function YearSlider({ min, max, value, onChange }: YearSliderProps) {
  // Local state for immediate visual feedback
  const [localValue, setLocalValue] = useState(value);
  const rafRef = useRef<number | null>(null);
  const pendingValue = useRef<number | null>(null);

  // Sync local state when props change (e.g., from play button or external source)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Flush pending changes using requestAnimationFrame for smooth updates
  const flushChanges = useCallback(() => {
    if (pendingValue.current !== null) {
      onChange(pendingValue.current);
      pendingValue.current = null;
    }
  }, [onChange]);

  // Handle slider change with RAF-throttled parent updates
  const handleChange = useCallback((values: number[]) => {
    const newValue = values[0];
    
    // Update local state immediately for visual feedback
    setLocalValue(newValue);
    
    // Store pending value
    pendingValue.current = newValue;
    
    // Schedule parent update on next animation frame (throttles to ~60fps)
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        flushChanges();
      });
    }
  }, [flushChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">Year</h3>
        <span className="px-3 py-1 bg-pastel-purple/20 rounded-lg font-semibold text-pastel-mauve text-sm">
          {localValue}
        </span>
      </div>
      
      <div className="px-2">
        <Range
          step={1}
          min={min}
          max={max}
          values={[localValue]}
          onChange={handleChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-2 w-full rounded-full"
              style={{
                background: getTrackBackground({
                  values: [localValue],
                  colors: ['#957DAD', '#e5e7eb'],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => {
            const { key, ...restProps } = props;
            return (
              <div
                key={key}
                {...restProps}
                className="w-5 h-5 bg-white rounded-full shadow-md border-2 border-pastel-mauve
                         focus:outline-none focus:ring-2 focus:ring-pastel-purple/30
                         transition-transform hover:scale-110"
              />
            );
          }}
        />
      </div>
      
      {/* Year labels */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

