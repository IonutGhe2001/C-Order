import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: open,
  });
  const users = usersQuery.data?.items || [];
  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(assigneeQuery.toLowerCase()),
  );
  const statusVals = (filters.status as string[]) || [];
  const assigneeVals = (filters.assignees as string[]) || [];

  const toggleAssignee = (id: string) => {
    if (assigneeVals.includes(id)) {
      onChange({ ...filters, assignees: assigneeVals.filter((a) => a !== id) });
    } else {
      onChange({ ...filters, assignees: [...assigneeVals, id] });
    }
  };

  const clear = () => {
    onChange({ status: [], assignees: [], from: undefined, to: undefined });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-64 flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>{t("buttons.filters")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-medium">
              {t("labels.status")}
            </label>
            <select
              multiple
              className="mt-1 w-full border rounded p-2 text-sm"
              value={statusVals}
              onChange={(e) =>
                onChange({
                  ...filters,
                  status: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value,
                  ),
                })
              }
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(s.label)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("labels.assignees")}
            </label>
            <Input
              className="mt-1"
              placeholder={t("placeholders.assigneeSearchExample")}
              value={assigneeQuery}
              onChange={(e) => setAssigneeQuery(e.target.value)}
            />
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {filteredUsers.map((u: any) => (
                <label key={u.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={assigneeVals.includes(u.id)}
                    onCheckedChange={() => toggleAssignee(u.id)}
                    id={`assignee-${u.id}`}
                  />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("labels.dueDate")}
            </label>
            <div className="flex gap-2 mt-1">
              <Input
                type="date"
                className="text-sm"
                value={filters.from ?? ""}
                onChange={(e) => onChange({ ...filters, from: e.target.value })}
              />
              <Input
                type="date"
                className="text-sm"
                value={filters.to ?? ""}
                onChange={(e) => onChange({ ...filters, to: e.target.value })}
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