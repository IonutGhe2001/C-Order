import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit, listUsers, TaskPayload, updateAttachment, sendTaskEmail, deleteTask, archiveTask } from '../lib/api';
import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../lib/lucide-icon';
import { getStatusColor } from '../lib/status-colors';
import Breadcrumb from '../components/Breadcrumb';
import RichEditor from '../components/tasks/RichEditor';
import AssigneeChips from '../components/tasks/AssigneeChips';
import OrderDeliveryPanel from '../components/tasks/OrderDeliveryPanel';
import AttachmentsPanel from '../components/tasks/AttachmentsPanel';
import AttachmentView from '../components/tasks/AttachmentView';
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
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';

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

const orderTypeOptions = [
  { value: 'Achizitie Directa', label: 'Achizitie Directa' },
  { value: 'Acord Cadru', label: 'Acord Cadru' },
  { value: 'Contract', label: 'Contract' },
];


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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', id] });
      trackEvent('file_attached', { taskId: id });
    },
  });

  const emailMut = useMutation({
    mutationFn: (data: any) => sendTaskEmail(id!, data),
    onSuccess: () => trackEvent('email_sent', { taskId: id }),
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

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [desc, setDesc] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [supplier, setSupplier] = useState('');
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
  const commentsRef = useRef<HTMLDetailsElement>(null);
  const [editingAttachment, setEditingAttachment] = useState<any | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv: any = shouldReduceMotion ? 'div' : motion.div;

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
      setSupplier(task.supplier?.name || '');
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
  const handleSave = () => {
    const payload: Partial<TaskPayload> = {
      title,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      description: desc,
      assignees,
      supplier: supplier || null,
      orderDate: orderDate ? new Date(orderDate).toISOString() : null,
      orderReceivedDate: orderReceivedDate ? new Date(orderReceivedDate).toISOString() : null,
      orderNumber: orderNumber || null,
      authority: authority || null,
      orderType: orderType || null,
      productsReceivedDate: productsReceivedDate ? new Date(productsReceivedDate).toISOString() : null,
      deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
    };
    update.mutate(payload);
  };
  if (isLoading) {
    return (
      <main id="main-content">
        <MotionDiv
          {...(!shouldReduceMotion && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
          })}
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
        </MotionDiv>
      </main>
    );
  }

  if (isError || !t) {
    return (
      <main id="main-content">
        <MotionDiv
          {...(!shouldReduceMotion && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
          })}
          className="p-6 text-center space-y-4"
        >
          <p className="text-red-600">{t('messages.taskLoadFailed')}</p>
          <Button onClick={() => refetch()}>{t('buttons.retry')}</Button>
        </MotionDiv>
      </main>
    );
  }

  return (
    <>
    <div className="sticky top-0 z-10 bg-background border-b p-2 flex justify-end gap-2">
      <Button size="sm" onClick={handleSave}>{t('buttons.save')}</Button>
      <Button variant="outline" size="sm" onClick={() => setEmailOpen(true)}>
        <Icon name="mail" className="h-4 w-4 mr-1" /> {t('labels.email')}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">{t('buttons.archive')}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.archiveTask')}</AlertDialogTitle>
            <AlertDialogDescription>{t('messages.confirmAction')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveMut.mutate()}>{t('buttons.archive')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">{t('buttons.delete')}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.deleteTask')}</AlertDialogTitle>
            <AlertDialogDescription>{t('messages.confirmAction')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate()}>{t('buttons.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    <main id="main-content">
    <MotionDiv
      {...(!shouldReduceMotion && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      })}
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
            <div className="flex items-center gap-2">
              <select value={status} onChange={e => changeStatus(e.target.value)} className="border p-1 rounded">
                {statuses.map(s => (
                  <option key={s} value={s}>{t(labels[s])}</option>
                ))}
              </select>
              <Badge variant={getStatusColor(status)}>{t(labels[status])}</Badge>
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
          <Input
            className="mt-1 w-full"
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              save({ supplier: e.target.value || null });
            }}
          />
          <SaveIndicator mutation={update} />
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
              orderTypes={orderTypeOptions}
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
            <details className="border rounded">
              <summary className="cursor-pointer font-medium px-2 py-1">{t('labels.files')}</summary>
              <div className="p-2">
                <AttachmentsPanel
                  hideTitle
                  attachments={task.attachments || []}
                  onSave={(attId, file) => attachmentMut.mutate({ attId, file })}
                  onEdit={(att) => setEditingAttachment(att)}
                />
              </div>
            </details>
        </div>
        <div className="space-y-4">
          <details ref={commentsRef} className="border rounded">
              <summary className="cursor-pointer font-medium px-2 py-1">{t('labels.comments')}</summary>
              <div className="p-2">
                <CommentsPanel
                  hideTitle
                  inputId="add-comment-input"
                  comments={task.comments || []}
                  onAdd={(body) => commentMut.mutate(body)}
                />
              </div>
            </details>
            <details className="border rounded">
              <summary className="cursor-pointer font-medium px-2 py-1">{t('labels.auditLog')}</summary>
              <div className="p-2">
                <ActivityAuditPanel
                  hideTitle
                  audit={audit?.items || []}
                  loading={auditLoading}
                  error={!!auditError}
                  onRetry={() => refetchAudit()}
                />
              </div>
            </details>
        </div>
      </div>
    </MotionDiv>
    <div className="md:hidden sticky bottom-4 flex justify-end p-4">
      <Button onClick={() => { commentsRef.current && (commentsRef.current.open = true); document.getElementById('add-comment-input')?.focus(); }}>
        {t('buttons.add')}
      </Button>
    </div>
    </main>

    <Dialog open={!!editingAttachment} onOpenChange={(o) => { if (!o) setEditingAttachment(null); }}>
      <DialogContent>
        <DialogTitle>{editingAttachment?.filename}</DialogTitle>
        {editingAttachment && (
          <AttachmentView
            attachment={editingAttachment}
            onSave={(file) => {
              attachmentMut.mutate({ attId: editingAttachment.id, file });
              setEditingAttachment(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
    
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
