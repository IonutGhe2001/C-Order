import { Input } from '../ui/input';
import { SaveIndicator } from '../ui/save-indicator';

interface SupplierSectionProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
  mutation: any;
}

export default function SupplierSection({ value, label, onChange, mutation }: SupplierSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Input
        className="mt-1 w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <SaveIndicator mutation={mutation} />
    </div>
  );
}