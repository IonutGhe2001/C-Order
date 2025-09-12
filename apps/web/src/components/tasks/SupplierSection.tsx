import { Input } from '../ui/input';
import { Icon } from '../../lib/lucide-icon';

interface SupplierSectionProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

export default function SupplierSection({ value, label, onChange }: SupplierSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium flex items-center gap-1">
        <Icon name="building-2" className="h-4 w-4" /> {label}
      </label>
      <Input
        className="mt-1 w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}