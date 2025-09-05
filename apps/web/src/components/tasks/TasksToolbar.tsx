import React from "react";
import { useTranslation } from "react-i18next";
import { useIsFetching } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Archive,
  Filter,
  LayoutGrid,
  LayoutList,
  MoreHorizontal,
  Trash,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Table, VisibilityState } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ColumnsMenu from "./ColumnsMenu";

type QuickFilter = "" | "overdue" | "today" | "noAssignee";

interface TasksToolbarProps {
  quickFilter: [QuickFilter, React.Dispatch<React.SetStateAction<QuickFilter>>];
  selected: string[];
  onArchive: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onCreate: () => void;
  onOpenFilters: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  table?: Table<any>;
  columnVisibility: VisibilityState;
  view: "table" | "card";
  setView: React.Dispatch<React.SetStateAction<"table" | "card">>;
}

export function TasksToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}

export default function TasksToolbar({
  quickFilter,
  selected,
  onArchive,
  onDelete,
  onCreate,
  onOpenFilters,
  search,
  onSearchChange,
  table,
  columnVisibility,
  view,
  setView,
}: TasksToolbarProps) {
  const [filter, setFilter] = quickFilter;
  const isLoading = useIsFetching({ queryKey: ["tasks"] }) > 0;
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState(search);

  React.useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  React.useEffect(() => {
    const handler = setTimeout(() => onSearchChange(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearchChange]);

  if (isLoading) {
    return <TasksToolbarSkeleton />;
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{t("nav.tasks")}</h1>
      <div className="flex items-center gap-3">
        {selected.length > 0 && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={t("buttons.archive")}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dialogs.archiveSelected")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("messages.confirmAction")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onArchive(selected)}>
                    {t("buttons.archive")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  aria-label={t("buttons.delete")}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dialogs.deleteSelected")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("messages.confirmAction")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(selected)}>
                    {t("buttons.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        <Input
          placeholder={t("placeholders.searchTasks", { defaultValue: "Search tasks..." })}
          aria-label={t("labels.searchTasks", { defaultValue: "Search tasks" })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 w-48"
        />
        <Select
          value={filter || "all"}
          onValueChange={(v) =>
            setFilter(v === "all" ? "" : (v as QuickFilter))
          }
        >
          <SelectTrigger
            className="h-8 w-[140px] text-sm"
            aria-label={t("labels.quickFilter", { defaultValue: "Quick filter" })}
          >
            <SelectValue placeholder={t("labels.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("labels.all")}</SelectItem>
            <SelectItem value="overdue">{t("filters.overdue")}</SelectItem>
            <SelectItem value="today">{t("filters.today")}</SelectItem>
            <SelectItem value="noAssignee">
              {t("filters.noAssignee")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={onCreate}>
          {t("buttons.addTask")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              aria-label={t("labels.moreActions", { defaultValue: "More actions" })}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table && (
              <ColumnsMenu table={table} visibility={columnVisibility}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {t("labels.columns")}
                </DropdownMenuItem>
              </ColumnsMenu>
            )}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setView(view === "table" ? "card" : "table");
              }}
            >
              {view === "table"
                ? t("labels.cardView", { defaultValue: "Card view" })
                : t("labels.tableView", { defaultValue: "Table view" })}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenFilters}>
              {t("buttons.filters")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
