import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Icon } from "@/lib/lucide-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const priorityOptions = [
  { value: "LOW", label: "priority.LOW" },
  { value: "MEDIUM", label: "priority.MEDIUM" },
  { value: "HIGH", label: "priority.HIGH" },
];

interface FiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onCreate: () => void;
  view: "table" | "card";
  onViewChange: (view: "table" | "card") => void;
}

export default function FiltersBar({
  filters,
  onChange,
  onCreate,
  view,
  onViewChange,
}: FiltersBarProps) {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const users = data?.items || [];

  const clear = () =>
    onChange({
      q: undefined,
      status: undefined,
      assignees: undefined,
      from: undefined,
      to: undefined,
      priority: undefined,
    });
    const statuses = statusOptions();

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-end gap-2 justify-between">
        <div className="flex flex-wrap items-end gap-2">
      <Input
          value={filters.q || ""}
          onChange={(e) =>
            onChange({ ...filters, q: e.target.value || undefined })
          }
          placeholder={t("placeholders.searchTasks")}
          className="w-40"
        />
        <Select
          value={(filters.status as string) || ""}
          onValueChange={(v) => onChange({ ...filters, status: v || undefined })}
        >
          <SelectTrigger className="w-40 text-sm">
            <SelectValue placeholder={t("labels.status")} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {statuses.map((s) => (
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
        <Select
          value={(filters.priority as string) || ""}
          onValueChange={(v) => onChange({ ...filters, priority: v || undefined })}
        >
          <SelectTrigger className="w-40 text-sm">
            <SelectValue placeholder={t("labels.priority")} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {priorityOptions.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {t(p.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker
          startDate={filters.from ? new Date(filters.from) : null}
          endDate={filters.to ? new Date(filters.to) : null}
          selectsRange
          onChange={(dates: [Date | null, Date | null]) => {
            const [start, end] = dates;
            onChange({
              ...filters,
              from: start ? start.toISOString().slice(0, 10) : undefined,
              to: end ? end.toISOString().slice(0, 10) : undefined,
            });
          }}
          className="w-52 border rounded p-2 text-sm bg-white"
          dateFormat="yyyy-MM-dd"
          placeholderText={t("labels.dateRange", {
            defaultValue: "Date range",
          })}
          popperClassName="z-50"
          portalId="root"
        />
        <Button variant="outline" onClick={clear}>
          {t("buttons.clearFilters")}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-brand-fg">{t("labels.views")}</span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={view === "table" ? "secondary" : "ghost"}
                aria-label={t("labels.tableView", { defaultValue: "Table view" })}
                onClick={() => onViewChange("table")}
              >
                <Icon name="table" className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("labels.tableView")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={view === "card" ? "secondary" : "ghost"}
                aria-label={t("labels.cardView", { defaultValue: "Card view" })}
                onClick={() => onViewChange("card")}
              >
                <Icon name="layout-grid" className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("labels.cardView")}</TooltipContent>
          </Tooltip>
        </div>
        <Button onClick={onCreate}>{t("buttons.addTask")}</Button>
      </div>
    </div>
    </TooltipProvider>
  );
}