import { useEffect, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export function SaveIndicator({ mutation }: { mutation: UseMutationResult<any, any, any, any> }) {
  const [showSaved, setShowSaved] = useState(false);
  const { t } = useTranslation();
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
    return <span className="ml-2 text-xs text-foreground">{t('messages.saving')}</span>;
  }
  if (showSaved) {
    return <span className="ml-2 text-xs text-green-600">{t('messages.saved')}</span>;
  }
  return null;
}