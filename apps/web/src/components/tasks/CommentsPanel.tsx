import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Icon } from '../../lib/lucide-icon';
import { useTranslation } from 'react-i18next';

interface Comment { id: string; body: string; author?: { name?: string }; }

interface Props {
  comments: Comment[];
  onAdd: (body: string) => void;
  hideTitle?: boolean;
  inputId?: string;
}

export default function CommentsPanel({ comments, onAdd, hideTitle, inputId }: Props) {
  const [comment, setComment] = useState('');
  const { t } = useTranslation();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onAdd(comment.trim());
      setComment('');
    }
  };

  return (
    <div>
      {!hideTitle && <h2 className="font-medium mb-2">{t('labels.comments')}</h2>}
      {comments?.length ? (
        <ul className="space-y-2 text-sm mb-2 max-h-64 overflow-auto">
          {comments.map(c => (
            <li key={c.id}><b>{c.author?.name ?? t('anonymous')}</b>: {c.body}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500 flex items-center mb-2">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> {t('messages.noComments')}
        </div>
      )}
      <form onSubmit={submit} className="flex space-x-2">
        <Input
          id={inputId}
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="flex-1 text-sm"
          placeholder={t('placeholders.addComment')}
        />
        <Button type="submit" className="px-2 py-1 text-sm">{t('buttons.send')}</Button>
      </form>
    </div>
  );
}