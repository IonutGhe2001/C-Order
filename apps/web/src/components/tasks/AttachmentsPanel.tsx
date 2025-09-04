import { useState, type DragEvent } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../../lib/lucide-icon';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAttachment } from '../../lib/api';
import AttachmentView from './AttachmentView';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  taskId: string;
  attachments: any[];
  onSave: (attId: string, file: File) => void;
  hideTitle?: boolean;
}

export default function AttachmentsPanel({ taskId, attachments, onSave, hideTitle }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const deleteMut = useMutation({
    mutationFn: ({ taskId, attId }: { taskId: string; attId: string }) =>
      deleteAttachment(taskId, attId),
    onSuccess: (_data, { taskId }) => qc.invalidateQueries({ queryKey: ['task', taskId] }),
  });

  const [selectedAttachment, setSelectedAttachment] = useState<any | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onSave('new', f);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn('space-y-2', isDragOver && 'border-2 border-dashed rounded-md p-2')}
    >
      {!hideTitle && <h2 className="font-medium">{t('labels.files')}</h2>}
      {attachments?.length ? (
        <ul className="space-y-2">
          {attachments.map((a: any) => (
            <li key={a.id} className="flex items-center justify-between gap-2">
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => setSelectedAttachment(a)}
              >
                {a.filename}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('buttons.delete')}
                onClick={() => deleteMut.mutate({ taskId: a.taskId, attId: a.id })}
              >
                <Icon name="trash" className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-foreground flex items-center">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> {t('messages.filesEmpty')}
        </div>
      )}
      <input type="file" onChange={e => {
        const f = e.target.files?.[0];
        if (f) onSave('new', f);
      }} />

      <Dialog open={!!selectedAttachment} onOpenChange={(o) => { if (!o) setSelectedAttachment(null); }}>
        <DialogContent className="max-w-[90vw]">
          <DialogTitle>{selectedAttachment?.filename}</DialogTitle>
          {selectedAttachment && (
            <AttachmentView
              taskId={taskId}
              attachment={selectedAttachment}
              onSave={(file) => {
                onSave(selectedAttachment.id, file);
                setSelectedAttachment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}