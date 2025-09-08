import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { listUsers, TaskFilters } from "@/lib/api";
import { statusOptions } from "./columns";

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export default function FiltersDrawer({
  open,
  onOpenChange,
  filters,
  onChange,
}: FiltersDrawerProps) {
  const { t } = useTranslation();
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: open,
  });
  const users = usersQuery.data?.items || [];
  const statusVal = (filters.status as string) || "";
  const assigneeVal = (filters.assignees as string) || "";

  const clear = () => {
    onChange({ status: undefined, assignees: undefined, from: undefined, to: undefined });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-64 flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>{t("buttons.filters")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium">
              {t("labels.status")}
            </label>
            <Select
              value={statusVal}
              onValueChange={(v) => onChange({ ...filters, status: v || undefined })}
            >
              <SelectTrigger className="mt-1 w-full text-sm">
                <SelectValue placeholder={t("labels.status")} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {t(s.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("labels.assignees")}
            </label>
            <Select
              value={assigneeVal}
              onValueChange={(v) => onChange({ ...filters, assignees: v || undefined })}
            >
              <SelectTrigger className="mt-1 w-full text-sm">
                <SelectValue placeholder={t("labels.assignees")} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {users.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("labels.dueDate")}
            </label>
            <div className="flex gap-2 mt-1">
              <DatePicker
                selected={filters.from ? new Date(filters.from) : null}
                onChange={(date: Date | null) =>
                  onChange({
                    ...filters,
                    from: date ? date.toISOString().slice(0, 10) : undefined,
                  })
                }
                className="w-full border rounded p-2 text-sm"
                dateFormat="yyyy-MM-dd"
                placeholderText="From"
              />
              <DatePicker
                selected={filters.to ? new Date(filters.to) : null}
                onChange={(date: Date | null) =>
                  onChange({
                    ...filters,
                    to: date ? date.toISOString().slice(0, 10) : undefined,
                  })
                }
                className="w-full border rounded p-2 text-sm"
                dateFormat="yyyy-MM-dd"
                placeholderText="To"
              />
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={clear} className="mt-auto">
          {t("buttons.clearFilters")}
        </Button>
      </SheetContent>
    </Sheet>
  );
}