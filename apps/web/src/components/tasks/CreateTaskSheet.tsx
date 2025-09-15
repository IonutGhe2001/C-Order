import React, { useEffect, useRef, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskSchema, TaskFormValues } from "@/lib/validation/task";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { listUsers, createTask } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import Stepper from "@/components/ui/Stepper";
import { loadStatuses, getStatusLabels } from "@/lib/status-store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const orderTypeOptions = [
  "Achizitie Directa",
  "Acord Cadru",
  "Contract",
];

export default function CreateTaskSheet({
  triggerText,
  open: openProp,
  onOpenChange,
  showTrigger = true,
}: {
  triggerText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { t } = useTranslation();
  const resetStepRef = useRef<() => void>(() => {});
  const [statuses, setStatuses] = useState<string[]>(loadStatuses());

  useEffect(() => {
    const handler = () => setStatuses(loadStatuses());
    window.addEventListener('statuses-updated', handler);
    return () => window.removeEventListener('statuses-updated', handler);
  }, []);
  const statusLabels = useMemo(() => getStatusLabels(), [statuses]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: statuses[0] || "OPEN",
      priority: "MEDIUM",
      assignees: [],
      supplier: "",
      dueDate: new Date(),
      earlyDelivery: false,
      attachments: [],
    },
  });

  const queryClient = useQueryClient();
  const toast = useToast();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: open,
  });


  const createMutation = useMutation({
    mutationFn: (values: TaskFormValues) => {
      const { attachments, ...rest } = values;
      return createTask({
        ...rest,
        dueDate: rest.dueDate?.toISOString(),
        orderDate: rest.orderDate?.toISOString(),
        orderReceivedDate: rest.orderReceivedDate?.toISOString(),
        productsReceivedDate: rest.productsReceivedDate?.toISOString(),
        deliveryDate: rest.deliveryDate?.toISOString(),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: t("messages.taskCreated"), variant: "success" });
      trackEvent("task_created", { taskId: data?.id });
      setOpen(false);
      resetStepRef.current();
      form.reset();
    },
    onError: () => toast({ title: t("messages.taskCreateFailed"), variant: "error" }),
  });

  const onSubmit = (values: TaskFormValues) => {
    createMutation.mutate(values);
  };

  // autosave
  const watched = form.watch();
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("task-draft", JSON.stringify(watched));
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(t);
  }, [watched]);

  const AssigneeCombobox = ({ tabIndex }: { tabIndex: number }) => {
    const [query, setQuery] = useState("");
    const options = usersQuery.data?.items || [];
    const filtered = options.filter((o: any) =>
      o.name.toLowerCase().includes(query.toLowerCase())
    );
    const selected = form.watch("assignees");
    const toggle = (id: string) => {
      if (selected.includes(id)) {
        form.setValue(
          "assignees",
          selected.filter((s) => s !== id)
        );
      } else {
        form.setValue("assignees", [...selected, id]);
      }
    };
    return (
      <div className="border p-2 rounded-md flex flex-col gap-2">
        <Input
          tabIndex={tabIndex}
          placeholder={t("placeholders.assigneeSearchExample")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filtered.map((u: any) => (
            <label key={u.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => toggle(u.id)}
              />
              <span>{u.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const registerDate = (name: keyof TaskFormValues) => {
    const value = form.watch(name) as Date | undefined;
    return {
      value: value ? value.toISOString().substring(0, 10) : "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        form.setValue(name, e.target.value ? new Date(e.target.value) : undefined),
    };
  };

  const DropzoneField = ({ tabIndex }: { tabIndex: number }) => {
    const files = form.watch("attachments") as File[];
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (accepted) => form.setValue("attachments", accepted),
    });
    return (
      <div
        {...getRootProps()}
        tabIndex={tabIndex}
        className="p-4 border-2 border-dashed rounded-md text-center cursor-pointer space-y-2"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>{t('placeholders.dropFiles')}</p>
        ) : (
          <p>{t('placeholders.dragOrClick')}</p>
        )}
        {files && files.length > 0 && (
          <ul className="text-sm text-left">
            {files.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button>{triggerText ?? t('buttons.addTask')}</Button>
        </SheetTrigger>
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('titles.createTask')}</SheetTitle>
        </SheetHeader>
        <Stepper
          steps={[t('steps.details'), t('steps.assignment'), t('steps.attachments')]}
        >
          {({ step, next, back, isLast, setStep }) => {
            resetStepRef.current = () => setStep(0);
            let ti = 1;
            return (
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                {step === 0 && (
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.title')}</label>
                      <Input
                        tabIndex={ti++}
                        placeholder={t('placeholders.taskTitleExample')}
                        {...form.register("title")}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-brand text-danger">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.description')}</label>
                      <Textarea
                        tabIndex={ti++}
                        placeholder={t('placeholders.taskDescriptionExample')}
                        {...form.register("description")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t('labels.status')}</label>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((s) => (
                          <Button
                            type="button"
                            key={s}
                            tabIndex={ti++}
                            variant={
                              form.watch("status") === s ? "default" : "outline"
                            }
                            onClick={() => form.setValue("status", s)}
                          >
                            {t(statusLabels[s] || `statuses.${s}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.priority')}</label>
                      <select
                        className="w-full border p-2 rounded-md"
                        tabIndex={ti++}
                        {...form.register("priority")}
                      >
                        <option value="LOW">{t('priority.LOW')}</option>
                        <option value="MEDIUM">{t('priority.MEDIUM')}</option>
                        <option value="HIGH">{t('priority.HIGH')}</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.supplier')}</label>
                      <Input
                        tabIndex={ti++}
                        placeholder={t('placeholders.supplierExample')}
                        value={form.watch('supplier') || ''}
                        onChange={(e) => form.setValue('supplier', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              {step === 1 && (
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.assignees')}</label>
                      {usersQuery.isLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : usersQuery.isError ? (
                        <p className="text-sm text-danger">{t('messages.loadError')}</p>
                      ) : (
                        <AssigneeCombobox tabIndex={ti++} />
                      )}
                      {form.formState.errors.assignees && (
                        <p className="text-sm text-brand text-danger">
                          {form.formState.errors.assignees.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.dueDate')}</label>
                      <Controller
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date) => field.onChange(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            className="w-full rounded-md border p-2 text-sm"
                            placeholderText="2024-12-31 12:00"
                            popperClassName="z-50"
                            portalId="root"
                          />
                        )}
                      />
                      {form.formState.errors.dueDate && (
                        <p className="text-sm text-brand text-danger">
                          {form.formState.errors.dueDate.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.orderDate')}</label>
                      <Input
                        type="date"
                        tabIndex={ti++}
                        placeholder="2024-01-01"
                        {...registerDate("orderDate")}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.orderNumber')}</label>
                      <Input
                        tabIndex={ti++}
                        placeholder={t('placeholders.orderNumberExample')}
                        {...form.register("orderNumber")}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.authority')}</label>
                      <Input
                        tabIndex={ti++}
                        placeholder={t('placeholders.authorityExample')}
                        {...form.register("authority")}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.orderType')}</label>
                      <select
                        className="w-full border p-2 rounded-md"
                        tabIndex={ti++}
                        {...form.register('orderType')}
                      >
                        <option value="">{t('placeholders.select')}</option>
                        {orderTypeOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.orderReceivedDate')}</label>
                      <Input
                        type="date"
                        tabIndex={ti++}
                        placeholder="2024-01-10"
                        {...registerDate("orderReceivedDate")}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('labels.productsReceivedDate')}</label>
                      <Input
                        type="date"
                        tabIndex={ti++}
                        placeholder="2024-02-01"
                        {...registerDate("productsReceivedDate")}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        tabIndex={ti++}
                        checked={form.watch("earlyDelivery")}
                        onChange={(e) =>
                          form.setValue("earlyDelivery", e.target.checked)
                        }
                      />
                      <span className="text-sm font-medium">{t('labels.earlyDelivery')}</span>
                    </div>
                    {form.watch("earlyDelivery") && (
                      <Input
                        type="date"
                        tabIndex={ti++}
                        placeholder="2024-01-15"
                        {...registerDate("deliveryDate")}
                      />
                    )}
                  </div>
                )}
                {step === 2 && (
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div>
                      <label className="text-sm font-medium">{t('labels.attachments')}</label>
                      <DropzoneField tabIndex={ti++} />
                    </div>
                  </div>
                )}
              <SheetFooter className="pt-4 pb-6">
                  {step === 0 ? (
                    <>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          tabIndex={ti++}
                        >
                          {t('buttons.cancel')}
                        </Button>
                      </SheetClose>
                      <Button type="button" tabIndex={ti++} onClick={next}>
                        {t('buttons.continue')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        tabIndex={ti++}
                        onClick={back}
                      >
                        {t('buttons.back')}
                      </Button>
                      {isLast ? (
                        <Button
                          type="submit"
                          tabIndex={ti++}
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            t('buttons.save')
                          )}
                        </Button>
                      ) : (
                        <Button type="button" tabIndex={ti++} onClick={next}>
                          {t('buttons.continue')}
                        </Button>
                      )}
                    </>
                  )}
                </SheetFooter>
              </form>
            );
          }}
        </Stepper>
      </SheetContent>
    </Sheet>
  );
}
