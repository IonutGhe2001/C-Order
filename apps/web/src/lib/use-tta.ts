import { useRef } from 'react';
import { logPerformance } from './logger';

export function useTimeToAction(event: string) {
  const start = useRef(performance.now());
  return () => {
    const duration = performance.now() - start.current;
    logPerformance(event, duration);
  };
}