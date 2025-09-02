import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import Editor from '@monaco-editor/react';
import { getFileUrl } from '../../lib/api';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  attachment: any;
  onSave: (file: File) => void;
}

export default function AttachmentView({ attachment, onSave }: Props) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  const url = getFileUrl(attachment.url);
  const editUrl = attachment.editUrl ? getFileUrl(attachment.editUrl) : undefined;

  const isText = attachment.mimeType?.startsWith('text/') || attachment.mimeType === 'application/json';
  const isPdf = attachment.mimeType === 'application/pdf';
  const officeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const isOffice = officeTypes.includes(attachment.mimeType);

  useEffect(() => {
    if (isText) {
      fetch(url).then((r) => r.text()).then(setContent);
    }
  }, [attachment, url]);

  if (isText) {
    return (
      <div className="flex flex-col gap-2">
        <Editor
          height="200px"
          defaultLanguage="plaintext"
          value={content}
          onChange={(val: string | undefined) => setContent(val ?? '')}
        />
        <Button
          size="sm"
          onClick={() => {
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

  if (isPdf) {
    return (
      <div className="space-y-2">
        <Document
          file={url}
          onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
        >
          <Page pageNumber={page} />
        </Document>
        {numPages > 1 && (
          <div className="flex gap-2">
            <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t('buttons.previous')}
            </Button>
            <Button size="sm" disabled={page >= numPages} onClick={() => setPage((p) => p + 1)}>
              {t('buttons.next')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isOffice) {
    if (editUrl) {
      return (
        <div className="flex flex-col gap-2">
          <iframe src={editUrl} title={attachment.filename} className="w-full h-64 border" />
          <Button
            size="sm"
            onClick={async () => {
              const resp = await fetch(url);
              const blob = await resp.blob();
              const file = new File([blob], attachment.filename, { type: attachment.mimeType });
              onSave(file);
            }}
          >
            {t('buttons.save')}
          </Button>
        </div>
      );
    }
    return (
      <DocViewer
        documents={[{ uri: url, fileType: attachment.mimeType }]}
        pluginRenderers={DocViewerRenderers}
        style={{ height: 400 }}
      />
    );
  }

  if (attachment.mimeType?.startsWith('image/')) {
    return <img src={url} alt={attachment.filename} className="max-h-64" />;
  }

  return (
    <a className="text-brand hover:underline focus-visible:ring-brand" href={url}>
      {attachment.filename}
    </a>
  );
}