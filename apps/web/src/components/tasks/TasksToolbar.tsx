import React from "react";
import { useTranslation } from "react-i18next";
import { useIsFetching } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
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

type QuickFilter = "" | "overdue" | "today" | "noAssignee";

interface TasksToolbarProps {
  quickFilter: [QuickFilter, React.Dispatch<React.SetStateAction<QuickFilter>>];
  selected: string[];
  onArchive: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onCreate: () => void;
  onOpenFilters: () => void;
}

export function TasksToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
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
}: TasksToolbarProps) {
  const [filter, setFilter] = quickFilter;
  const isLoading = useIsFetching({ queryKey: ["tasks"] }) > 0;
  const { t } = useTranslation();

  if (isLoading) {
    return <TasksToolbarSkeleton />;
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{t("nav.tasks")}</h1>
      <div className="flex items-center gap-2">
        {selected.length > 0 && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  {t("buttons.archive")}
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
                <Button size="sm" variant="destructive">
                  {t("buttons.delete")}
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
        <Select
          value={filter || "all"}
          onValueChange={(v) =>
            setFilter(v === "all" ? "" : (v as QuickFilter))
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-sm">
            <SelectValue />
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
        <Button size="sm" variant="outline" onClick={onOpenFilters}>
          <Filter className="mr-2 h-4 w-4" />
          {t("buttons.filters")}
        </Button>
        <Button size="sm" onClick={onCreate}>
          {t("buttons.addTask")}
        </Button>
      </div>
    </div>
  );
}
