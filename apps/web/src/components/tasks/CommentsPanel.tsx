import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Icon } from '../../lib/lucide-icon';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../ui/skeleton';

interface Comment { id: string; body: string; author?: { name?: string }; }

interface Props {
  comments: Comment[];
  onAdd: (body: string) => void;
  hideTitle?: boolean;
  inputId?: string;
}

export default function CommentsPanel({ comments, onAdd, hideTitle, inputId }: Props) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError(t('validation.commentRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await Promise.resolve(onAdd(comment.trim()));
      setComment('');
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {!hideTitle && <h2 className="font-medium">{t('labels.comments')}</h2>}
      {comments?.length ? (
        <ul className="space-y-2 text-sm max-h-64 overflow-auto">
          {comments.map(c => (
            <li key={c.id}><b>{c.author?.name ?? t('anonymous')}</b>: {c.body}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-brand-fg flex items-center">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> {t('messages.noComments')}
        </div>
      )}
      <form onSubmit={submit} className="space-y-2">
        <div className="flex space-x-2">
          <Input
            id={inputId}
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="flex-1 text-sm"
            placeholder={t('placeholders.addComment')}
            tabIndex={1}
            disabled={loading}
          />
          <Button
            type="submit"
            className="px-2 py-1 text-sm"
            tabIndex={2}
            disabled={loading || !comment.trim()}
          >
            {loading ? <Skeleton className="h-4 w-10" /> : t('buttons.send')}
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}