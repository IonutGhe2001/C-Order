import AssigneeChips from './AssigneeChips';
import { Skeleton } from '../ui/skeleton';
import { Icon } from '../../lib/lucide-icon';

interface AssigneeSectionProps {
  users: { id: string; name: string }[];
  value: string[];
  loading: boolean;
  error: boolean;
  label: string;
  errorMessage: string;
  onChange: (ids: string[]) => void;
}

export default function AssigneeSection({
  users,
  value,
  loading,
  error,
  label,
  errorMessage,
  onChange,
}: AssigneeSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium flex items-center gap-1">
        <Icon name="users" className="h-4 w-4" /> {label}
      </label>
      {loading ? (
        <Skeleton className="h-10 w-full mt-1" />
      ) : error ? (
        <div className="mt-1 text-red-600 text-sm">{errorMessage}</div>
      ) : (
        <AssigneeChips users={users} value={value} onChange={onChange} />
      )}
    </div>
  );
}