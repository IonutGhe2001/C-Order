import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import Editor from '@monaco-editor/react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth/mammoth.browser';
import { Document as DocxDocument, Packer, Paragraph } from 'docx';
import { getFileUrl } from '../../lib/api';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  attachment: any;
  onSave: (file: File) => void;
}

export default function AttachmentView({ attachment, onSave }: Props) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');

  const url = getFileUrl(attachment.url);
  const editUrl = attachment.editUrl ? getFileUrl(attachment.editUrl) : undefined;

  const isText = attachment.mimeType?.startsWith('text/') || attachment.mimeType === 'application/json';
  const isPdf = attachment.mimeType === 'application/pdf';
  const docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isDocx = attachment.mimeType === docxMime;
  const officeTypes = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const isOffice = officeTypes.includes(attachment.mimeType);

  useEffect(() => {
    if (isText) {
      fetch(url).then((r) => r.text()).then(setContent);
      } else if (isPdf) {
      (async () => {
        const doc = await pdfjs.getDocument(url).promise;
        const pages: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: any) => item.str).join(' '));
        }
        setContent(pages.join('\n'));
      })();
    } else if (isDocx) {
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((buffer) => mammoth.extractRawText({ arrayBuffer: buffer }))
        .then((res) => setContent(res.value));
    }
  }, [attachment, url]);

  if (isText || isPdf || isDocx) {
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
            if (isText) {
              const blob = new Blob([content], { type: attachment.mimeType });
              const file = new File([blob], attachment.filename, { type: attachment.mimeType });
              onSave(file);
            } else if (isPdf) {
              const pdfDoc = await PDFDocument.create();
              const page = pdfDoc.addPage();
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              page.drawText(content, { x: 50, y: page.getHeight() - 50, font, size: 12 });
              const pdfBytes = await pdfDoc.save();
              const file = new File([pdfBytes.buffer as ArrayBuffer], attachment.filename, { type: 'application/pdf' });
              onSave(file);
            } else if (isDocx) {
              const paragraphs = content.split('\n').map((line) => new Paragraph(line));
              const doc = new DocxDocument({ sections: [{ properties: {}, children: paragraphs }] });
              const blob = await Packer.toBlob(doc);
              const file = new File([blob], attachment.filename, { type: docxMime });
              onSave(file);
            }
          }}
        >
          {t('buttons.save')}
        </Button>
      </div>
    );
  }

  if (isOffice) {
    if (editUrl) {
      return (
        <div className="flex flex-col items-center gap-2 max-h-[80vh] overflow-y-auto">
          <iframe
            src={editUrl}
            title={attachment.filename}
            className="w-full h-[70vh] border"
          />
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
      <div className="flex justify-center max-h-[80vh] overflow-y-auto">
        <DocViewer
          documents={[{ uri: url, fileType: attachment.mimeType }]}
          pluginRenderers={DocViewerRenderers}
          style={{ height: '70vh' }}
        />
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