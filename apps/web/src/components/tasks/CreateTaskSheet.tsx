import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/components/ui/toaster";
import { listUsers, listVali, createTask } from "@/lib/api";
import { useDropzone } from "react-dropzone";

const statuses = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "LIVRAT_PARTIAL",
  "FINALIZAT",
  "CANCELLED",
] as const;

const statusLabels: Record<string, string> = {
  OPEN: "Deschis",
  IN_PROGRESS: "În progres",
  BLOCKED: "Blocat",
  DONE: "Finalizat",
  LIVRAT_PARTIAL: "Livrat parțial",
  FINALIZAT: "Finalizat",
  CANCELLED: "Anulat",
};

export default function CreateTaskSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assignees: [],
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

  const orderTypesQuery = useQuery({
    queryKey: ["vali", "orderType"],
    queryFn: () => listVali("orderType"),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task creat", variant: "success" });
      setOpen(false);
      setStep(1);
      form.reset();
    },
    onError: () => toast({ title: "Crearea task-ului a eșuat", variant: "error" }),
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

  const AssigneeCombobox = () => {
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
      <div className="border p-2 rounded-md">
        <Input
          placeholder="Caută..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-40 overflow-y-auto mt-2 space-y-1">
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

  const DropzoneField = () => {
    const files = form.watch("attachments") as File[];
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (accepted) => form.setValue("attachments", accepted),
    });
    return (
      <div
        {...getRootProps()}
        className="p-4 border-2 border-dashed rounded-md text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Lasă fișierele aici...</p>
        ) : (
          <p>Trage fișiere sau apasă pentru a selecta</p>
        )}
        {files && files.length > 0 && (
          <ul className="mt-2 text-sm text-left">
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
      <SheetTrigger asChild>
        <Button>Adaugă task</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Creează task</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
          {step === 1 && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-sm font-medium">Titlu</label>
                <Input className="mt-1" {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Descriere</label>
                <Textarea className="mt-1" {...form.register("description")} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {statuses.map((s) => (
                    <Button
                      type="button"
                      key={s}
                      variant={form.watch("status") === s ? "default" : "outline"}
                      onClick={() => form.setValue("status", s)}
                    >
                      {statusLabels[s]}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Prioritate</label>
                <select
                  className="mt-1 w-full border p-2 rounded-md"
                  {...form.register("priority")}
                >
                  <option value="LOW">Mică</option>
                  <option value="MEDIUM">Medie</option>
                  <option value="HIGH">Mare</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsabili</label>
                {usersQuery.isLoading ? (
                  <p className="text-sm">Încărcare...</p>
                ) : usersQuery.isError ? (
                  <p className="text-sm text-red-600">Eroare la încărcare</p>
                ) : (
                  <AssigneeCombobox />
                )}
                {form.formState.errors.assignees && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.assignees.message}
                  </p>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-sm font-medium">Data limită</label>
                <Input type="date" className="mt-1" {...registerDate("dueDate")} />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.dueDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Data comandă</label>
                <Input type="date" className="mt-1" {...registerDate("orderDate")} />
              </div>
              <div>
                <label className="text-sm font-medium">Număr comandă</label>
                <Input className="mt-1" {...form.register("orderNumber")} />
              </div>
              <div>
                <label className="text-sm font-medium">Autoritate</label>
                <Input className="mt-1" {...form.register("authority")} />
              </div>
              <div>
                <label className="text-sm font-medium">Tip comandă</label>
                {orderTypesQuery.isLoading ? (
                  <p className="text-sm">Încărcare...</p>
                ) : orderTypesQuery.isError ? (
                  <p className="text-sm text-red-600">Eroare la încărcare</p>
                ) : (
                  <select
                    className="mt-1 w-full border p-2 rounded-md"
                    {...form.register("orderType")}
                  >
                    <option value="">Selectează</option>
                    {orderTypesQuery.data?.items?.map((o: any) => (
                      <option key={o.id || o.value} value={o.value || o.id}>
                        {o.label || o.name || o.value}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Data primire comandă</label>
                <Input
                  type="date"
                  className="mt-1"
                  {...registerDate("orderReceivedDate")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data primire produse</label>
                <Input
                  type="date"
                  className="mt-1"
                  {...registerDate("productsReceivedDate")}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.watch("earlyDelivery")}
                  onChange={(e) => form.setValue("earlyDelivery", e.target.checked)}
                />
                <span className="text-sm font-medium">Livrare mai devreme</span>
              </div>
              {form.watch("earlyDelivery") && (
                <Input type="date" className="mt-1" {...registerDate("deliveryDate")} />
              )}
              <div>
                <label className="text-sm font-medium">Atașamente</label>
                <DropzoneField />
              </div>
            </div>
          )}
          <SheetFooter className="pt-4">
            {step === 1 ? (
              <>
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Anulează
                  </Button>
                </SheetClose>
                <Button type="button" onClick={() => setStep(2)}>
                  Continuă
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Înapoi
                </Button>
                <Button type="submit">Salvează</Button>
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
