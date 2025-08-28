import { useEffect, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';

export function SaveIndicator({ mutation }: { mutation: UseMutationResult<any, any, any, any> }) {
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (mutation.isSuccess) {
      setShowSaved(true);
      t = setTimeout(() => setShowSaved(false), 2000);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [mutation.isSuccess]);

  if (mutation.isPending) {
    return <span className="ml-2 text-xs text-gray-500">saving...</span>;
  }
  if (showSaved) {
    return <span className="ml-2 text-xs text-green-600">saved</span>;
  }
  return null;
}