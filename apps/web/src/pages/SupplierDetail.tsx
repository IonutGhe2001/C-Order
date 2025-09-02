import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getSupplier, getFileUrl, updateAttachment } from '../lib/api';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import AttachmentView from '../components/tasks/AttachmentView';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { useTranslation } from 'react-i18next';

export default function SupplierDetail() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id!),
  });

  const attachmentMut = useMutation({
    mutationFn: ({ attId, taskId, file }: { attId: string; taskId: string; file: File }) =>
      updateAttachment(taskId, attId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplier', id] }),
  });

  const attachments = (data?.tasks || []).flatMap((task: any) =>
    (task.attachments || []).map((a: any) => ({
      ...a,
      url: getFileUrl(a.url),
      taskId: task.id,
      taskTitle: task.title,
    }))
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-4 text-center text-red-600">
        {t('messages.suppliersLoadFailed')}
        <Button variant="outline" className="ml-2" onClick={() => refetch()}>
          {t('buttons.retry')}
        </Button>
      </div>
    );
  }

  const supplier = data;

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main id="main-content" className="p-4 md:ml-60 mt-14 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{supplier.name}</h1>
          <p className="text-sm text-foreground">
            {supplier.email || '-'} {supplier.phone ? ` | ${supplier.phone}` : ''}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">{t('titles.orderHistory')}</h2>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="p-2 border-b text-left">{t('labels.title')}</th>
                <th className="p-2 border-b text-left">{t('labels.status')}</th>
              </tr>
            </thead>
            <tbody>
              {supplier.tasks?.map((task: any) => (
                <tr
                  key={task.id}
                  tabIndex={0}
                  className="border-b hover:bg-brand-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/tasks/${task.id}`);
                    }
                  }}
                >
                  <td className="p-2">{task.title}</td>
                  <td className="p-2">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">{t('labels.attachments')}</h2>
          {attachments.length ? (
            <>
              <ul className="list-disc pl-5 space-y-1">
                {attachments.map((att: any) => (
                  <li key={att.id} className="flex items-center gap-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={() => setSelectedAttachment(att)}
                    >
                      {att.filename}
                    </Button>
                    <span className="text-sm text-foreground">({att.taskTitle})</span>
                  </li>
                ))}
              </ul>
              <Dialog open={!!selectedAttachment} onOpenChange={(o) => { if (!o) setSelectedAttachment(null); }}>
                <DialogContent className="max-w-[90vw]">
                  <DialogTitle>{selectedAttachment?.filename}</DialogTitle>
                  {selectedAttachment && (
                    <AttachmentView
                      attachment={selectedAttachment}
                      onSave={(file) => {
                        attachmentMut.mutate({
                          attId: selectedAttachment.id,
                          taskId: selectedAttachment.taskId,
                          file,
                        });
                        setSelectedAttachment(null);
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <p className="text-sm text-foreground">{t('messages.noAttachments')}</p>
          )}
        </div>
      </main>
    </>
  );
}