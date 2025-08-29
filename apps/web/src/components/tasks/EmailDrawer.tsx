import { useState } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ to?: string; subject?: string; body?: string }>({});
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  const handleSend = async () => {
    const errs: { to?: string; subject?: string; body?: string } = {};
    if (!to.trim()) errs.to = t('validation.recipientsRequired');
    if (!subject.trim()) errs.subject = t('validation.subjectRequired');
    if (!body.trim()) errs.body = t('validation.bodyRequired');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await Promise.resolve(onSend());
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 space-y-2 w-full max-w-lg">
        <h2 className="text-lg font-medium mb-2">{t('titles.sendEmail')}</h2>
        <Input
          placeholder={t('placeholders.recipients')}
          value={to}
          onChange={e => onChange({ to: e.target.value })}
          tabIndex={1}
          disabled={loading}
        />
        {errors.to && <p className="text-sm text-danger">{errors.to}</p>}
        <Input
          placeholder={t('placeholders.subject')}
          className="mt-2"
          value={subject}
          onChange={e => onChange({ subject: e.target.value })}
          tabIndex={2}
          disabled={loading}
        />
        {errors.subject && <p className="text-sm text-danger">{errors.subject}</p>}
        <Textarea
          className="mt-2 h-40"
          value={body}
          onChange={e => onChange({ body: e.target.value })}
          placeholder={t('placeholders.emailBodyExample')}
          tabIndex={3}
          disabled={loading}
        />
        {errors.body && <p className="text-sm text-danger">{errors.body}</p>}
        <div className="flex justify-end space-x-2 mt-2">
          <Button variant="outline" onClick={onClose} tabIndex={4} disabled={loading}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSend} tabIndex={5} disabled={loading}>
            {loading ? <Skeleton className="h-4 w-16" /> : t('buttons.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}