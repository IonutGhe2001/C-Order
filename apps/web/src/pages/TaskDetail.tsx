import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit, listUsers, TaskPayload, updateAttachment, sendTaskEmail } from '../lib/api';
import { useState, useEffect, useMemo, type ElementType } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import BottomActionBar from '../components/ui/bottom-action-bar';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon, type IconName } from '../lib/lucide-icon';
import { Badge, type BadgeProps } from '../components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { cn } from '@/lib/utils';
import Breadcrumb from '../components/Breadcrumb';
import RichEditor from '../components/tasks/RichEditor';
import AssigneeSection from '../components/tasks/AssigneeSection';
import SupplierSection from '../components/tasks/SupplierSection';
import OrderDetailsSection from '../components/tasks/OrderDetailsSection';
import AttachmentsPanel from '../components/tasks/AttachmentsPanel';
import CommentsPanel from '../components/tasks/CommentsPanel';
import ActivityAuditPanel from '../components/tasks/ActivityAuditPanel';
import TaskNav from '../components/tasks/task-nav';
import EmailDrawer from '../components/tasks/EmailDrawer';
import { useTranslation } from 'react-i18next';
import { statusLabels } from '../components/tasks/columns';
import { SaveIndicator } from '../components/ui/save-indicator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { formatDateTime } from '@/lib/i18n';

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

const statusColorClasses: Record<string, string> = {
  OPEN: 'text-info',
  IN_PROGRESS: 'text-warning',
  BLOCKED: 'text-danger',
  DONE: 'text-success',
  LIVRAT_PARTIAL: 'text-warning',
  FINALIZAT: 'text-success',
  CANCELLED: 'text-danger',
};

const statusIcons: Record<string, IconName> = {
  OPEN: 'circle',
  IN_PROGRESS: 'loader-2',
  BLOCKED: 'ban',
  DONE: 'check-circle',
  LIVRAT_PARTIAL: 'circle-dot',
  FINALIZAT: 'check-circle',
  CANCELLED: 'x-circle',
};

const priorityIcons: Record<string, IconName> = {
  LOW: 'arrow-down',
  MEDIUM: 'arrow-right',
  HIGH: 'arrow-up',
};

const priorityColorClasses: Record<string, string> = {
  LOW: 'text-success',
  MEDIUM: 'text-warning',
  HIGH: 'text-danger',
};

const statusBadgeVariants: Record<string, BadgeProps['variant']> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  BLOCKED: 'danger',
  DONE: 'success',
  LIVRAT_PARTIAL: 'warning',
  FINALIZAT: 'success',
  CANCELLED: 'danger',
};

const priorityBadgeVariants: Record<string, BadgeProps['variant']> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

const orderTypeOptions = [
  { value: 'Achizitie Directa', label: 'Achizitie Directa' },
  { value: 'Acord Cadru', label: 'Acord Cadru' },
  { value: 'Contract', label: 'Contract' },
];

export default function TaskDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
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

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
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
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv: ElementType = shouldReduceMotion ? 'div' : motion.div;

  const slaDate = task?.sla ? new Date(task.sla) : null;

  const dueStatus = useMemo(() => {
    if (!dueDate || !slaDate) return 'normal';
    const due = new Date(dueDate);
    if (due.getTime() > slaDate.getTime()) return 'overdue';
    const diff = slaDate.getTime() - due.getTime();
    return diff <= 24 * 60 * 60 * 1000 ? 'warning' : 'normal';
  }, [dueDate, slaDate]);

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

  const changeStatus = (s: string) => {
    setStatus(s);
    update.mutate({ status: s });
  };
  const save = (data: Partial<TaskPayload>) => update.mutate(data);

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
    <main id="main-content" className="p-6 space-y-4">
        <header className="sticky top-0 z-10 bg-background border-b p-2 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Breadcrumb items={[{ label: t('nav.tasks'), href: '/tasks' }, { label: `#${task.id}` }]} />
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Icon name="share-2" className="h-4 w-4 mr-1" /> Share
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
                <Icon name="mail" className="h-4 w-4 mr-1" /> {t('labels.email')}
              </Button>
            </div>
          </div>
        <div className="flex items-center flex-wrap gap-2">
            <Input
              className="text-2xl font-semibold flex-1 border-none focus-visible:ring-0 p-0"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              onBlur={() => save({ title })}
            />
            <SaveIndicator mutation={update} />
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
              <PopoverTrigger asChild>
                <Badge
                  variant={statusBadgeVariants[status]}
                  className="cursor-pointer flex items-center gap-1"
                >
                  <Icon name={statusIcons[status]} className="h-4 w-4" />
                  <span>{t(labels[status])}</span>
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <ul className="flex flex-col">
                  {statuses.map(s => (
                    <li key={s}>
                      <button
                        className="flex items-center gap-2 px-2 py-1 text-sm w-full hover:bg-muted"
                        onClick={() => {
                          changeStatus(s);
                          setStatusPopoverOpen(false);
                        }}
                      >
                        <Icon name={statusIcons[s]} className={cn('h-4 w-4', statusColorClasses[s])} />
                        <span>{t(labels[s])}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <SaveIndicator mutation={update} />
            <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
              <PopoverTrigger asChild>
                <Badge
                  variant={priority ? priorityBadgeVariants[priority] : 'info'}
                  className="cursor-pointer flex items-center gap-1"
                >
                  {priority ? (
                    <>
                      <Icon name={priorityIcons[priority]} className="h-4 w-4" />
                      <span>{t(priorityLabels[priority])}</span>
                    </>
                  ) : (
                    <span>{t('labels.priority')}</span>
                  )}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <ul className="flex flex-col">
                  {priorities.map(p => (
                    <li key={p}>
                      <button
                        className="flex items-center gap-2 px-2 py-1 text-sm w-full hover:bg-muted"
                        onClick={() => {
                          setPriority(p);
                          save({ priority: p || undefined });
                          setPriorityPopoverOpen(false);
                        }}
                      >
                        <Icon name={priorityIcons[p]} className={cn('h-4 w-4', priorityColorClasses[p])} />
                        <span>{t(priorityLabels[p])}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'px-2 py-1 rounded text-sm',
                      dueStatus === 'overdue'
                        ? 'text-danger bg-danger/10'
                        : dueStatus === 'warning'
                        ? 'text-warning bg-warning/10'
                        : 'text-success bg-success/10'
                    )}
                  >
                    {dueDate || '-'}
                  </div>
                </TooltipTrigger>
                {slaDate && (
                  <TooltipContent>{formatDateTime(slaDate)}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

      <TaskNav />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <section id="overview" className="md:col-span-8 space-y-4">
            <div className="border rounded p-4 space-y-2">
              <RichEditor value={desc} onChange={setDesc} onBlur={() => save({ description: desc })} />
              <SaveIndicator mutation={update} />
            </div>
            <div className="border rounded p-4">
              <OrderDetailsSection
                orderDate={orderDate}
                orderReceivedDate={orderReceivedDate}
                orderNumber={orderNumber}
                authority={authority}
                orderType={orderType}
                productsReceivedDate={productsReceivedDate}
                earlyDelivery={earlyDelivery}
                deliveryDate={deliveryDate}
                orderTypes={orderTypeOptions}
                setOrderDate={setOrderDate}
                setOrderReceivedDate={setOrderReceivedDate}
                setOrderNumber={setOrderNumber}
                setAuthority={setAuthority}
                setOrderType={setOrderType}
                setProductsReceivedDate={setProductsReceivedDate}
                setEarlyDelivery={setEarlyDelivery}
                setDeliveryDate={setDeliveryDate}
                save={save}
                mutation={update}
              />
            </div>
            <div id="comments" className="border rounded p-4">
              <CommentsPanel
                hideTitle
                inputId="add-comment-input"
                comments={task.comments || []}
                onAdd={(body) => commentMut.mutate(body)}
              />
            </div>
          </section>
          <aside className="md:col-span-4 space-y-4">
            <div className="border rounded p-4 space-y-4">
              <AssigneeSection
                users={usersQuery.data?.items || []}
                value={assignees}
                loading={usersQuery.isLoading}
                error={!!usersQuery.isError}
                label={t('labels.assignees')}
                errorMessage={t('messages.usersLoadFailed')}
                onChange={(vals: string[]) => {
                  setAssignees(vals);
                  save({ assignees: vals });
                }}
                mutation={update}
              />
              <SaveIndicator mutation={update} />
              <SupplierSection
                value={supplier}
                label={t('labels.supplier')}
                onChange={(val) => {
                  setSupplier(val);
                  save({ supplier: val || null });
                }}
                mutation={update}
              />
              <SaveIndicator mutation={update} />
              <div className="space-y-1 text-sm">
                <h3 className="font-medium">{t('labels.keyDates')}</h3>
                <ul className="space-y-1">
                  <li>{t('labels.orderDate')}: {orderDate || '-'}</li>
                  <li>{t('labels.orderReceivedDate')}: {orderReceivedDate || '-'}</li>
                  <li>{t('labels.productsReceivedDate')}: {productsReceivedDate || '-'}</li>
                  <li>{t('labels.deliveryDate')}: {deliveryDate || '-'}</li>
                </ul>
              </div>
              <AttachmentsPanel
                attachments={task.attachments || []}
                onSave={(attId, file) => attachmentMut.mutate({ attId, file })}
              />
            </div>
            <div id="activity" className="border rounded p-4 max-h-80 overflow-auto">
              <ActivityAuditPanel
                hideTitle
                audit={audit?.items || []}
                loading={auditLoading}
                error={!!auditError}
                onRetry={() => refetchAudit()}
              />
            </div>
          </aside>
        </div>

      <div id="attachments" />

        <BottomActionBar>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1"
              onClick={() => {
                document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
                setTimeout(() => document.getElementById('add-comment-input')?.focus(), 100)
              }}
            >
              <Icon name="message-circle" className="h-5 w-5" />
              <span className="text-xs">Comentariu</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1"
              onClick={() => {
                document.getElementById('attachments')?.scrollIntoView({ behavior: 'smooth' })
                setTimeout(() => document.querySelector<HTMLInputElement>('input[type=file]')?.click(), 100)
              }}
            >
              <Icon name="paperclip" className="h-5 w-5" />
              <span className="text-xs">Atașament</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1"
              onClick={() => setEmailOpen(true)}
            >
              <Icon name="mail" className="h-5 w-5" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </BottomActionBar>
      </main>
    
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
