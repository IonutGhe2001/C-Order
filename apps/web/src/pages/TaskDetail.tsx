import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit, listUsers, TaskPayload, updateAttachment, sendTaskEmail, deleteTask, archiveTask } from '../lib/api';
import { useState, useEffect, type ElementType } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import FAB from '../components/ui/fab';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon, type IconName } from '../lib/lucide-icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '@/lib/utils';
import Breadcrumb from '../components/Breadcrumb';
import RichEditor from '../components/tasks/RichEditor';
import Stepper from '../components/ui/Stepper';
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
import { SidePanel } from '../components/ui/side-panel';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState<'comments' | 'audit'>('comments');
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv: ElementType = shouldReduceMotion ? 'div' : motion.div;

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

  const AuxiliaryFields = () => (
    <Stepper
      steps={[t('labels.assignees'), t('labels.supplier'), t('labels.orderDetails')]}
    >
      {({ step, next, back, isLast }) => (
        <div className="space-y-4">
          {step === 0 && (
            <AssigneeSection
              users={usersQuery.data?.items || []}
              value={assignees}
              loading={usersQuery.isLoading}
              error={!!usersQuery.isError}
              label={t('labels.assignees')}
              errorMessage={t('messages.usersLoadFailed')}
              onChange={(vals) => {
                setAssignees(vals);
                save({ assignees: vals });
              }}
              mutation={update}
            />
            )}
          {step === 1 && (
            <SupplierSection
              value={supplier}
              label={t('labels.supplier')}
              onChange={(val) => {
                setSupplier(val);
                save({ supplier: val || null });
              }}
              mutation={update}
            />
          )}
          {step === 2 && (
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
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              {t('buttons.back')}
            </Button>
            {!isLast && (
              <Button onClick={next}>{t('buttons.continue')}</Button>
            )}
          </div>
        </div>
      )}
    </Stepper>
  );

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
      <TaskNav />
      <section id="overview" className="space-y-4">
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
                <Select value={status} onValueChange={changeStatus}>
                  <SelectTrigger className={cn('w-[12rem]', statusColorClasses[status])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          <Icon name={statusIcons[s]} className={cn('h-4 w-4', statusColorClasses[s])} />
                          <span>{t(labels[s])}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Select
                  value={priority || ''}
                  onValueChange={(val: string) => {
                    setPriority(val);
                    save({ priority: val || undefined });
                  }}
                >
                  <SelectTrigger className={cn('w-[10rem]', priority ? priorityColorClasses[priority] : undefined)}>
                    <SelectValue placeholder={t('labels.priority')} />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center gap-2">
                          <Icon name={priorityIcons[p]} className={cn('h-4 w-4', priorityColorClasses[p])} />
                          <span>{t(priorityLabels[p])}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="w-full">{t('labels.general')}</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{t('labels.general')}</SheetTitle>
                </SheetHeader>
                <AuxiliaryFields />
              </SheetContent>
            </Sheet>
          </div>

        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium mb-2">{t('labels.description')}</h2>
                <RichEditor value={desc} onChange={setDesc} onBlur={saveDesc} />
                <SaveIndicator mutation={update} />
              </div>
            </div>
          <div className="hidden md:block">
              <SidePanel>
                <AuxiliaryFields />
              </SidePanel>
            </div>
          </div>
        </section>

      <section id="activity" className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'comments' | 'audit')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <Icon name="message-square" className="h-4 w-4" aria-hidden="true" />
              {t('labels.comments')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Icon name="history" className="h-4 w-4" aria-hidden="true" />
              {t('labels.auditLog')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="comments" className="border rounded p-2 mt-2">
            <MotionDiv
              {...(!shouldReduceMotion && {
                initial: { opacity: 0, y: 4 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.2 },
              })}
            >
              <CommentsPanel
                hideTitle
                inputId="add-comment-input"
                comments={task.comments || []}
                onAdd={(body) => commentMut.mutate(body)}
              />
            </MotionDiv>
          </TabsContent>
          <TabsContent value="audit" className="border rounded p-2 mt-2">
            <MotionDiv
              {...(!shouldReduceMotion && {
                initial: { opacity: 0, y: 4 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.2 },
              })}
            >
              <ActivityAuditPanel
                hideTitle
                audit={audit?.items || []}
                loading={auditLoading}
                error={!!auditError}
                onRetry={() => refetchAudit()}
              />
            </MotionDiv>
          </TabsContent>
        </Tabs>
      </section>

      <section id="attachments" className="space-y-4">
        <MotionDiv
          {...(!shouldReduceMotion && {
            initial: { opacity: 0, y: 4 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.2 },
          })}
        >
          <AttachmentsPanel
            attachments={task.attachments || []}
            onSave={(attId, file) => attachmentMut.mutate({ attId, file })}
          />
        </MotionDiv>
      </section>
    </MotionDiv>
    <div className="md:hidden sticky bottom-4 flex justify-end p-4">
      <FAB
        onComment={() => {
          setActiveTab('comments')
          document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth' })
          setTimeout(() => document.getElementById('add-comment-input')?.focus(), 100)
        }}
        onAttachment={() => {
          document.getElementById('attachments')?.scrollIntoView({ behavior: 'smooth' })
          setTimeout(() => document.querySelector<HTMLInputElement>('input[type=file]')?.click(), 100)
        }}
        onEmail={() => setEmailOpen(true)}
      />
    </div>
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
