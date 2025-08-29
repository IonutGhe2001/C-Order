import { Button } from '../ui/button';
import { Icon } from '../../lib/lucide-icon';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function AttachmentView({ attachment, onSave }: { attachment: any; onSave: (file: File) => void }) {
  const [content, setContent] = useState('');
  const { t } = useTranslation();
  const isText = attachment.mimeType?.startsWith('text/');
  useEffect(() => {
    if (isText) {
      fetch(attachment.url).then(r => r.text()).then(setContent);
    }
  }, [attachment]);
  if (isText) {
    return (
      <div>
        <textarea className="w-full h-32 border" value={content} onChange={e => setContent(e.target.value)} />
        <Button size="sm" className="mt-2" onClick={() => {
          const blob = new Blob([content], { type: attachment.mimeType });
          const file = new File([blob], attachment.filename, { type: attachment.mimeType });
          onSave(file);
        }}>{t('buttons.save')}</Button>
      </div>
    );
  }
  if (attachment.mimeType?.startsWith('image/') || attachment.mimeType === 'application/pdf') {
    return <iframe src={attachment.url} title={attachment.filename} className="w-full h-64 border" />;
  }
  return (
    <a
      className="text-brand hover:underline focus-visible:ring-brand"
      href={attachment.url}
    >
      {attachment.filename}
    </a>
  );
}

interface Props {
  attachments: any[];
  onSave: (attId: string, file: File) => void;
  hideTitle?: boolean;
}

export default function AttachmentsPanel({ attachments, onSave, hideTitle }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {!hideTitle && <h2 className="font-medium mb-2">{t('labels.files')}</h2>}
      {attachments?.length ? (
        <ul className="space-y-4 mb-2">
          {attachments.map((a: any) => (
            <li key={a.id}>
              <AttachmentView attachment={a} onSave={(file: File) => onSave(a.id, file)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500 flex items-center mb-2">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> {t('messages.filesEmpty')}
        </div>
      )}
      <input type="file" onChange={e => {
        const f = e.target.files?.[0];
        if (f) onSave('new', f);
      }} />
    </div>
  );
}