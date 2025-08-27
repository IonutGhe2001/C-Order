import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit, listUsers, listVali, TaskPayload, updateAttachment, sendTaskEmail } from '../lib/api';
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

const statuses = [
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
  'LIVRAT_PARTIAL',
  'FINALIZAT',
  'CANCELLED',
];
const labels: Record<string, string> = {
  OPEN: 'Deschis',
  IN_PROGRESS: 'În progres',
  BLOCKED: 'Blocat',
  DONE: 'Finalizat',
  LIVRAT_PARTIAL: 'Livrat parțial',
  FINALIZAT: 'Finalizat',
  CANCELLED: 'Anulat',
};
const priorities = ['LOW', 'MEDIUM', 'HIGH'];
const priorityLabels: Record<string, string> = {
  LOW: 'Scăzută',
  MEDIUM: 'Medie',
  HIGH: 'Ridicată',
};

function AttachmentView({ attachment, onSave }: { attachment: any; onSave: (file: File) => void }) {
  const [content, setContent] = useState('');
  const isText = attachment.mimeType?.startsWith('text/');
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
          Salvează
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
  const {
    data: t,
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

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const orderTypesQuery = useQuery({ queryKey: ['vali', 'orderType'], queryFn: () => listVali('orderType') });

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [desc, setDesc] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
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
    if (t) {
      setTitle(t.title);
      setStatus(t.status);
      setPriority(t.priority || '');
      setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
      setDesc(t.description || '');
      setAssignees(t.assignees?.map((a: any) => a.id) || []);
      setOrderDate(t.orderDate ? t.orderDate.slice(0, 10) : '');
      setOrderReceivedDate(t.orderReceivedDate ? t.orderReceivedDate.slice(0, 10) : '');
      setOrderNumber(t.orderNumber || '');
      setAuthority(t.authority || '');
      setOrderType(t.orderType || '');
        setProductsReceivedDate(t.productsReceivedDate ? t.productsReceivedDate.slice(0, 10) : '');
        setDeliveryDate(t.deliveryDate ? t.deliveryDate.slice(0, 10) : '');
        setEarlyDelivery(!!t.deliveryDate);
        setEmailSubject(`Task ${t.title}`);
        setEmailBody(t.description || '');
      }
    }, [t]);

  const saveTitle = () => {
    if (title !== t?.title) update.mutate({ title });
  };
  const saveDesc = () => {
    if (desc !== t?.description) update.mutate({ description: desc });
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
        <p className="text-red-600">Încărcarea task-ului a eșuat.</p>
        <Button onClick={() => refetch()}>Reîncearcă</Button>
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
      <Breadcrumb items={[{ label: 'Task-uri', href: '/tasks' }, { label: t.title }]} />
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-2 flex-1">
          <Input
            className="text-2xl font-semibold border-b focus:outline-none flex-1"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
          />
          <select value={status} onChange={e => changeStatus(e.target.value)} className="border p-1 rounded">
            {statuses.map(s => (
              <option key={s} value={s}>{labels[s]}</option>
            ))}
          </select>
          <select value={priority} onChange={e => { setPriority(e.target.value); save({ priority: e.target.value || undefined }); }} className="border p-1 rounded">
            <option value="">Prioritate</option>
            {priorities.map(p => (
              <option key={p} value={p}>{priorityLabels[p]}</option>
            ))}
          </select>
          <Input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            onBlur={() => save({ dueDate: dueDate ? new Date(dueDate).toISOString() : null })}
          />
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="more-horizontal" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>More</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Responsabili</label>
          {usersQuery.isLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : usersQuery.isError ? (
            <div className="mt-1 text-red-600 text-sm">Încărcarea utilizatorilor a eșuat</div>
          ) : (
            <AssigneeChips
              users={usersQuery.data?.items || []}
              value={assignees}
              onChange={(vals) => {
                setAssignees(vals);
                save({ assignees: vals });
              }}
            />
          )}
        </div>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Descriere</h2>
            <RichEditor value={desc} onChange={setDesc} onBlur={saveDesc} />
          </div>
          <AttachmentsPanel
            attachments={t.attachments || []}
            onSave={(attId, file) => attachmentMut.mutate({ attId, file })}
          />
        </div>
        <div className="space-y-4">
          <CommentsPanel
            comments={t.comments || []}
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
          attachments: t.attachments?.map((a: any) => a.id),
        });
        setEmailOpen(false);
      }}
      onClose={() => setEmailOpen(false)}
    />
    </>
  );
}
