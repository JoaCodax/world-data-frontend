import { useEffect, useRef } from 'react';

interface PlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  onTick: () => boolean; // Return false to stop playing
  intervalMs?: number;
}

export function PlayButton({ isPlaying, onToggle, onTick, intervalMs = 500 }: PlayButtonProps) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        const shouldContinue = onTick();
        if (!shouldContinue) {
          onToggle(); // Stop playing when we reach the end
        }
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, onTick, intervalMs, onToggle]);

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center justify-center w-10 h-10 rounded-xl
        transition-all duration-200 ease-out border
        ${isPlaying
          ? 'bg-pastel-mauve text-white shadow-lg border-pastel-mauve/50 hover:bg-pastel-mauve/90'
          : 'bg-white text-gray-600 shadow-md border-gray-200 hover:bg-gray-50 hover:text-gray-800 hover:shadow-lg'
        }
      `}
      title={isPlaying ? 'Pause' : 'Play through years'}
    >
      {isPlaying ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

