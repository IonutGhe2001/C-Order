import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Icon } from '../../lib/lucide-icon';

interface Props {
  audit: any[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export default function ActivityAuditPanel({ audit, loading, error, onRetry }: Props) {
  return (
    <div>
      <h2 className="font-medium mb-2">Jurnal audit</h2>
      {loading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <div className="text-sm text-red-600 flex items-center">
          Încărcarea jurnalului de audit a eșuat
          <Button variant="outline" size="sm" className="ml-2" onClick={onRetry}>Reîncearcă</Button>
        </div>
      ) : audit?.length ? (
        <ul className="text-xs space-y-1 max-h-64 overflow-auto">
          {audit.map((a: any) => (
            <li key={a.id}>{a.user?.name || 'Sistemul'} {a.action} {new Date(a.createdAt).toLocaleString()}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500 flex items-center">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> Nicio intrare în jurnal
        </div>
      )}
    </div>
  );
}