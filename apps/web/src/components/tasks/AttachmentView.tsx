import { getFileUrl } from '../../lib/api';
import OnlyOfficeEditor from './OnlyOfficeEditor';

interface Props {
  taskId: string;
  attachment: any;
  onSave: (file: File) => void;
}

export default function AttachmentView({ taskId, attachment }: Props) {
  const url = getFileUrl(attachment.url);
  const editable = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'txt', 'pdf'];
  const ext = attachment.filename?.split('.').pop()?.toLowerCase() || '';

  if (editable.includes(ext)) {
    return (
      <div className="h-[70vh]">
        <OnlyOfficeEditor taskId={taskId} attId={attachment.id} />
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