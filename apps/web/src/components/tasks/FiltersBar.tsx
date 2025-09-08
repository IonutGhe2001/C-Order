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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { listUsers, TaskFilters } from "@/lib/api";
import { statusOptions } from "./columns";

interface FiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onCreate: () => void;
}

export default function FiltersBar({ filters, onChange, onCreate }: FiltersBarProps) {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const users = data?.items || [];

  const clear = () =>
    onChange({ status: undefined, assignees: undefined, from: undefined, to: undefined });

  return (
    <div className="flex flex-wrap items-end gap-2 justify-between">
      <div className="flex flex-wrap items-end gap-2">
      <Select
        value={(filters.status as string) || ""}
        onValueChange={(v) => onChange({ ...filters, status: v || undefined })}
      >
        <SelectTrigger className="w-40 text-sm">
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
      <Select
        value={(filters.assignees as string) || ""}
        onValueChange={(v) => onChange({ ...filters, assignees: v || undefined })}
      >
        <SelectTrigger className="w-40 text-sm">
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
      <DatePicker
        selected={filters.from ? new Date(filters.from) : null}
        onChange={(date: Date | null) =>
          onChange({
            ...filters,
            from: date ? date.toISOString().slice(0, 10) : undefined,
          })
        }
        className="w-40 border rounded p-2 text-sm bg-white"
        dateFormat="yyyy-MM-dd"
        placeholderText={t("labels.from", { defaultValue: "From" })}
      />
      <DatePicker
        selected={filters.to ? new Date(filters.to) : null}
        onChange={(date: Date | null) =>
          onChange({
            ...filters,
            to: date ? date.toISOString().slice(0, 10) : undefined,
          })
        }
        className="w-40 border rounded p-2 text-sm bg-white"
        dateFormat="yyyy-MM-dd"
        placeholderText={t("labels.to", { defaultValue: "To" })}
      />
      <Button variant="outline" onClick={clear}>
        {t("buttons.clearFilters")}
      </Button>
      </div>
      <Button onClick={onCreate}>
        {t("buttons.addTask")}
      </Button>
    </div>
  );
}