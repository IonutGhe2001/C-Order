import AssigneeChips from './AssigneeChips';
import { Skeleton } from '../ui/skeleton';
import { SaveIndicator } from '../ui/save-indicator';

interface AssigneeSectionProps {
  users: { id: string; name: string }[];
  value: string[];
  loading: boolean;
  error: boolean;
  label: string;
  errorMessage: string;
  onChange: (ids: string[]) => void;
  mutation: any;
}

export default function AssigneeSection({
  users,
  value,
  loading,
  error,
  label,
  errorMessage,
  onChange,
  mutation,
}: AssigneeSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      {loading ? (
        <Skeleton className="h-10 w-full mt-1" />
      ) : error ? (
        <div className="mt-1 text-red-600 text-sm">{errorMessage}</div>
      ) : (
        <>
          <AssigneeChips users={users} value={value} onChange={onChange} />
          <SaveIndicator mutation={mutation} />
        </>
      )}
    </div>
  );
}