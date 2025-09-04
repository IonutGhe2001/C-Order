import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Icon } from '../../lib/lucide-icon';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Props {
  audit: any[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  hideTitle?: boolean;
  className?: string;
}

export default function ActivityAuditPanel({
  audit,
  loading,
  error,
  onRetry,
  hideTitle,
  className,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {!hideTitle && <h2 className="font-medium">{t('labels.auditLog')}</h2>}
      {loading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <div className="text-sm text-red-600 flex items-center">
          {t('messages.auditLoadFailed')}
          <Button variant="outline" size="sm" className="ml-2" onClick={onRetry}>
            {t('buttons.retry')}
          </Button>
        </div>
      ) : audit?.length ? (
        <ul
          className={cn(
            'text-xs space-y-2 max-h-80 overflow-auto relative pl-4 border-l',
            className,
          )}
        >
          {audit.map((a: any) => (
            <li key={a.id} className="flex items-start">
              <Icon name="circle" className="h-2 w-2 text-brand mr-2 mt-1" />
              <span>
                {a.user?.name || t('system')} {a.action}{' '}
                {formatDateTime(new Date(a.createdAt))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-foreground flex items-center">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> {t('messages.noAuditEntries')}
        </div>
      )}
    </div>
  );
}