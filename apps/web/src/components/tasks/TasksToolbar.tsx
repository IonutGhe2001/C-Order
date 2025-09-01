import React from "react";
import { useTranslation } from "react-i18next";
import { useIsFetching } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
}

export default function TasksToolbar({
  quickFilter,
  selected,
  onArchive,
  onDelete,
  onCreate,
}: TasksToolbarProps) {
  const [filter, setFilter] = quickFilter;
  const isLoading = useIsFetching({ queryKey: ["tasks"] }) > 0;
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{t("nav.tasks")}</h1>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </>
        ) : (
          <>
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
            <Button
              size="sm"
              variant={filter === "overdue" ? "default" : "outline"}
              onClick={() => setFilter((f) => (f === "overdue" ? "" : "overdue"))}
            >
              {t("filters.overdue")}
            </Button>
            <Button
              size="sm"
              variant={filter === "today" ? "default" : "outline"}
              onClick={() => setFilter((f) => (f === "today" ? "" : "today"))}
            >
              {t("filters.today")}
            </Button>
            <Button
              size="sm"
              variant={filter === "noAssignee" ? "default" : "outline"}
              onClick={() =>
                setFilter((f) => (f === "noAssignee" ? "" : "noAssignee"))
              }
            >
              {t("filters.noAssignee")}
            </Button>
            <Button size="sm" onClick={onCreate}>
              {t("buttons.addTask")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
