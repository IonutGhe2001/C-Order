import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit, listUsers, listVali, listSuppliers, TaskPayload, updateAttachment, sendTaskEmail, deleteTask, archiveTask } from '../lib/api';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../components/ui/tooltip';
import { motion } from 'framer-motion';
import { Icon } from '../lib/lucide-icon';
import { getStatusColor } from '../lib/status-colors';
import Breadcrumb from '../components/Breadcrumb';
import RichEditor from '../components/tasks/RichEditor';
import AssigneeChips from '../components/tasks/AssigneeChips';
import OrderDeliveryPanel from '../components/tasks/OrderDeliveryPanel';
import AttachmentsPanel from '../components/tasks/AttachmentsPanel';
import CommentsPanel from '../components/tasks/CommentsPanel';
import ActivityAuditPanel from '../components/tasks/ActivityAuditPanel';
import EmailDrawer from '../components/tasks/EmailDrawer';
import { useTranslation } from 'react-i18next';
import { statusLabels } from '../components/tasks/columns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { SaveIndicator } from '../components/ui/save-indicator';

const statuses = [
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
  'LIVRAT_PARTIAL',
  'FINALIZAT',
  'CANCELLED',
];
const labels: Record<string, string> = statusLabels;
const priorities = ['LOW', 'MEDIUM', 'HIGH'];
const priorityLabels: Record<string, string> = {
  LOW: 'priority.LOW',
  MEDIUM: 'priority.MEDIUM',
  HIGH: 'priority.HIGH',
};

function AttachmentView({ attachment, onSave }: { attachment: any; onSave: (file: File) => void }) {
  const [content, setContent] = useState('');
  const isText = attachment.mimeType?.startsWith('text/');
  const { t } = useTranslation();
  useEffect(() => {
    if (isText) {
      fetch(attachment.url)
        .then((r) => r.text())
        .then(setContent);
    }
  }, [attachment]);
  if (isText) {
    return (
      <div>
        <textarea
          className="w-full h-32 border"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          size="sm"
          className="mt-2"
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
  if (attachment.mimeType?.startsWith('image/') || attachment.mimeType === 'application/pdf') {
    return <iframe src={attachment.url} title={attachment.filename} className="w-full h-64 border" />;
  }
  return (
    <a className="underline" href={attachment.url}>
      {attachment.filename}
    </a>
  );
}

export default function TaskDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: task,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ['task', id], queryFn: () => getTask(id!) });
  const {
    data: audit,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useQuery({ queryKey: ['task', id, 'audit'], queryFn: () => getTaskAudit(id!) });

  const update = useMutation({
    mutationFn: (data: any) => updateTask(id!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', id] }),
  });

  const commentMut = useMutation({
    mutationFn: (body: string) => addComment(id!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', id] }),
  });

  const attachmentMut = useMutation({
    mutationFn: ({ attId, file }: { attId: string; file: File }) =>
      updateAttachment(id!, attId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', id] }),
  });

  const emailMut = useMutation({
    mutationFn: (data: any) => sendTaskEmail(id!, data),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteTask(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    },
  });

  const archiveMut = useMutation({
    mutationFn: () => archiveTask(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    },
  });

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const orderTypesQuery = useQuery({ queryKey: ['vali', 'orderType'], queryFn: () => listVali('orderType') });
  const suppliersQuery = useQuery({ queryKey: ['suppliers'], queryFn: () => listSuppliers('') });

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [desc, setDesc] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderReceivedDate, setOrderReceivedDate] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [authority, setAuthority] = useState('');
  const [orderType, setOrderType] = useState('');
  const [productsReceivedDate, setProductsReceivedDate] = useState('');
  const [earlyDelivery, setEarlyDelivery] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setPriority(task.priority || '');
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
      setDesc(task.description || '');
      setAssignees(task.assignees?.map((a: any) => a.id) || []);
      setOrderDate(task.orderDate ? task.orderDate.slice(0, 10) : '');
      setOrderReceivedDate(task.orderReceivedDate ? task.orderReceivedDate.slice(0, 10) : '');
      setOrderNumber(task.orderNumber || '');
      setAuthority(task.authority || '');
      setOrderType(task.orderType || '');
      setProductsReceivedDate(task.productsReceivedDate ? task.productsReceivedDate.slice(0, 10) : '');
      setDeliveryDate(task.deliveryDate ? task.deliveryDate.slice(0, 10) : '');
      setEarlyDelivery(!!task.deliveryDate);
      setEmailSubject(`Task ${task.title}`);
      setEmailBody(task.description || '');
      setSupplierId(task.supplier?.id || '');
      }
    }, [task]);

  const saveTitle = () => {
    if (title !== task?.title) update.mutate({ title });
  };
  const saveDesc = () => {
    if (desc !== task?.description) update.mutate({ description: desc });
  };
  const changeStatus = (s: string) => {
    setStatus(s);
    update.mutate({ status: s });
  };
  const save = (data: Partial<TaskPayload>) => update.mutate(data);
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-6 space-y-4"
      >
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[150px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isError || !t) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-6 text-center space-y-4"
      >
        <p className="text-red-600">{t('messages.taskLoadFailed')}</p>
        <Button onClick={() => refetch()}>{t('buttons.retry')}</Button>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-4"
    >
      <Breadcrumb items={[{ label: t('nav.tasks'), href: '/tasks' }, { label: task.title }]} />
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-2 flex-1">
            <div className="flex items-center">
              <Input
                className="text-2xl font-semibold border-b focus:outline-none flex-1"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
              />
              <SaveIndicator mutation={update} />
            </div>
            <div className="flex items-center">
              <select value={status} onChange={e => changeStatus(e.target.value)} className="border p-1 rounded">
                {statuses.map(s => (
                  <option key={s} value={s}>{t(labels[s])}</option>
                ))}
              </select>
              <SaveIndicator mutation={update} />
            </div>
            <div className="flex items-center">
              <select value={priority} onChange={e => { setPriority(e.target.value); save({ priority: e.target.value || undefined }); }} className="border p-1 rounded">
                <option value="">{t('labels.priority')}</option>
                {priorities.map(p => (
                  <option key={p} value={p}>{t(priorityLabels[p])}</option>
                ))}
              </select>
              <SaveIndicator mutation={update} />
            </div>
            <div className="flex items-center">
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                onBlur={() => save({ dueDate: dueDate ? new Date(dueDate).toISOString() : null })}
              />
              <SaveIndicator mutation={update} />
            </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Icon name="share-2" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setEmailOpen(true)}>
                  <Icon name="mail" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email</TooltipContent>
            </Tooltip>
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Icon name="archive" className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive this task?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => archiveMut.mutate()}>Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Icon name="trash" className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMut.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">{t('labels.assignees')}</label>
          {usersQuery.isLoading ? (
              <Skeleton className="h-10 w-full mt-1" />
            ) : usersQuery.isError ? (
              <div className="mt-1 text-red-600 text-sm">{t('messages.usersLoadFailed')}</div>
            ) : (
              <>
                <AssigneeChips
                  users={usersQuery.data?.items || []}
                  value={assignees}
                  onChange={(vals) => {
                    setAssignees(vals);
                    save({ assignees: vals });
                  }}
                />
                <SaveIndicator mutation={update} />
              </>
            )}
          </div>
        <div>
          <label className="block text-sm font-medium">{t('labels.supplier')}</label>
          {suppliersQuery.isLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : suppliersQuery.isError ? (
            <div className="mt-1 text-red-600 text-sm">{t('messages.suppliersLoadFailed')}</div>
          ) : (
            <>
              <select
                className="mt-1 w-full border p-2 rounded-md"
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  save({ supplierId: e.target.value || null });
                }}
              >
                <option value="">{t('placeholders.select')}</option>
                {suppliersQuery.data?.items?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {supplierId && (
                <Link
                  to={`/suppliers/${supplierId}`}
                  className="text-sm underline block mt-1"
                >
                  {t('buttons.view')}
                </Link>
              )}
              <SaveIndicator mutation={update} />
            </>
          )}
        </div>
        <div>
            <OrderDeliveryPanel
              orderDate={orderDate}
              orderReceivedDate={orderReceivedDate}
              orderNumber={orderNumber}
              authority={authority}
              orderType={orderType}
              productsReceivedDate={productsReceivedDate}
              earlyDelivery={earlyDelivery}
              deliveryDate={deliveryDate}
              orderTypes={orderTypesQuery.data?.items || []}
              onChange={(d) => {
                if (d.orderDate !== undefined) setOrderDate(d.orderDate);
                if (d.orderReceivedDate !== undefined) setOrderReceivedDate(d.orderReceivedDate);
                if (d.orderNumber !== undefined) setOrderNumber(d.orderNumber);
                if (d.authority !== undefined) setAuthority(d.authority);
                if (d.orderType !== undefined) setOrderType(d.orderType);
                if (d.productsReceivedDate !== undefined) setProductsReceivedDate(d.productsReceivedDate);
                if (d.earlyDelivery !== undefined) setEarlyDelivery(d.earlyDelivery);
                if (d.deliveryDate !== undefined) setDeliveryDate(d.deliveryDate);
                const payload: any = {};
                if (d.orderDate !== undefined) payload.orderDate = d.orderDate ? new Date(d.orderDate).toISOString() : null;
                if (d.orderReceivedDate !== undefined) payload.orderReceivedDate = d.orderReceivedDate ? new Date(d.orderReceivedDate).toISOString() : null;
                if (d.orderNumber !== undefined) payload.orderNumber = d.orderNumber || null;
                if (d.authority !== undefined) payload.authority = d.authority || null;
                if (d.orderType !== undefined) payload.orderType = d.orderType || null;
                if (d.productsReceivedDate !== undefined) payload.productsReceivedDate = d.productsReceivedDate ? new Date(d.productsReceivedDate).toISOString() : null;
                if (d.deliveryDate !== undefined) payload.deliveryDate = d.deliveryDate ? new Date(d.deliveryDate).toISOString() : null;
                if (Object.keys(payload).length) save(payload);
              }}
            />
          <SaveIndicator mutation={update} />
          </div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="font-medium mb-2">{t('labels.description')}</h2>
              <RichEditor value={desc} onChange={setDesc} onBlur={saveDesc} />
              <SaveIndicator mutation={update} />
            </div>
            <AttachmentsPanel
              attachments={task.attachments || []}
              onSave={(attId, file) => attachmentMut.mutate({ attId, file })}
            />
        </div>
        <div className="space-y-4">
          <CommentsPanel
            comments={task.comments || []}
            onAdd={(body) => commentMut.mutate(body)}
          />
          <ActivityAuditPanel
            audit={audit?.items || []}
            loading={auditLoading}
            error={!!auditError}
            onRetry={() => refetchAudit()}
          />
        </div>
      </div>
    </motion.div>
      <EmailDrawer
      open={emailOpen}
      to={emailTo}
      subject={emailSubject}
      body={emailBody}
      onChange={({ to, subject, body }) => {
        if (to !== undefined) setEmailTo(to);
        if (subject !== undefined) setEmailSubject(subject);
        if (body !== undefined) setEmailBody(body);
      }}
      onSend={() => {
        emailMut.mutate({
          to: emailTo.split(',').map(s => s.trim()).filter(Boolean),
          subject: emailSubject,
          body: emailBody,
          attachments: task.attachments?.map((a: any) => a.id),
        });
        setEmailOpen(false);
      }}
      onClose={() => setEmailOpen(false)}
    />
    </>
  );
}
