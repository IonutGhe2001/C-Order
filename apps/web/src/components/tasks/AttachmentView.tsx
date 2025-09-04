import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import { getFileUrl } from '../../lib/api';
import OnlyOfficeEditor from './OnlyOfficeEditor';

interface Props {
  taskId: string;
  attachment: any;
  onSave: (file: File) => void;
}

export default function AttachmentView({ taskId, attachment, onSave }: Props) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');

  const url = getFileUrl(attachment.url);
  const isText = attachment.mimeType?.startsWith('text/') || attachment.mimeType === 'application/json';
  const isPdf = attachment.mimeType === 'application/pdf';
  const officeExt = ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp', 'rtf'];
  const ext = attachment.filename?.split('.').pop()?.toLowerCase() || '';
  const isOffice = officeExt.includes(ext);

  useEffect(() => {
    if (isText) {
      fetch(url).then((r) => r.text()).then(setContent);
    }
  }, [attachment, url, isText]);

  if (isOffice || isPdf) {
    return (
      <div className="flex flex-col gap-2">
        <OnlyOfficeEditor taskId={taskId} attId={attachment.id} />
      </div>
    );
  }

  if (isText) {
    return (
      <div className="flex flex-col items-center gap-2 max-h-[80vh] overflow-y-auto">
        <Editor
          height="200px"
          defaultLanguage="plaintext"
          value={content}
          onChange={(val: string | undefined) => setContent(val ?? '')}
        />
        <Button
          size="sm"
          onClick={async () => {
            const blob = new Blob([content], { type: attachment.mimeType });
            const file = new File([blob], attachment.filename, { type: attachment.mimeType });
            onSave(file);
          }}
        >
          {t('buttons.save')}
        </Button>
      </div>
    );
  }

  if (attachment.mimeType?.startsWith('image/')) {
    return <img src={url} alt={attachment.filename} className="max-h-64 mx-auto" />;
  }

  return (
    <a
      className="block text-center text-brand hover:underline focus-visible:ring-brand"
      href={url}
    >
      {attachment.filename}
    </a>
  );
}