import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { listUsers, TaskFilters } from "@/lib/api";
import { statusOptions } from "./columns";

interface FiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export default function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const users = data?.items || [];

  const clear = () =>
    onChange({ status: undefined, assignees: undefined, from: undefined, to: undefined });

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select
        value={(filters.status as string) || ""}
        onValueChange={(v) => onChange({ ...filters, status: v || undefined })}
      >
        <SelectTrigger className="w-40 text-sm">
          <SelectValue placeholder={t("labels.status")} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {t(s.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={(filters.assignees as string) || ""}
        onValueChange={(v) => onChange({ ...filters, assignees: v || undefined })}
      >
        <SelectTrigger className="w-40 text-sm">
          <SelectValue placeholder={t("labels.assignees")} />
        </SelectTrigger>
        <SelectContent>
          {users.map((u: any) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        className="w-40"
        value={filters.from || ""}
        onChange={(e) =>
          onChange({ ...filters, from: e.target.value || undefined })
        }
      />
      <Input
        type="date"
        className="w-40"
        value={filters.to || ""}
        onChange={(e) =>
          onChange({ ...filters, to: e.target.value || undefined })
        }
      />
      <Button variant="outline" onClick={clear}>
        {t("buttons.clearFilters")}
      </Button>
    </div>
  );
}