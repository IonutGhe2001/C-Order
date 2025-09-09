import { Input } from '../ui/input';

interface SupplierSectionProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

export default function SupplierSection({ value, label, onChange }: SupplierSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Input
        className="mt-1 w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}