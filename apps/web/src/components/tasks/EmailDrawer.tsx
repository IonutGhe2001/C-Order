import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface Props {
  open: boolean;
  to: string;
  subject: string;
  body: string;
  onChange: (fields: { to?: string; subject?: string; body?: string }) => void;
  onSend: () => void;
  onClose: () => void;
}

export default function EmailDrawer({ open, to, subject, body, onChange, onSend, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 space-y-2 w-full max-w-lg">
        <h2 className="text-lg font-medium mb-2">Trimite e-mail</h2>
        <Input
          placeholder="Destinatari (virgule)"
          value={to}
          onChange={e => onChange({ to: e.target.value })}
        />
        <Input
          placeholder="Subiect"
          className="mt-2"
          value={subject}
          onChange={e => onChange({ subject: e.target.value })}
        />
        <Textarea
          className="mt-2 h-40"
          value={body}
          onChange={e => onChange({ body: e.target.value })}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <Button variant="outline" onClick={onClose}>Anulează</Button>
          <Button onClick={onSend}>Trimite</Button>
        </div>
      </div>
    </div>
  );
}