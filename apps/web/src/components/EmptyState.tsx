import React from 'react';
import { Button } from './ui/button';
import emptySvg from '../assets/empty-state.svg';

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <img src={emptySvg} alt="Empty" className="w-32 h-32 mb-4" />
      <p className="mb-4 text-sm text-muted-foreground">No data available</p>
      <Button variant="secondary" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}