import React, { useState, Suspense, lazy } from "react";
import { useTranslation } from 'react-i18next';
import { useIsFetching, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
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
} from "../components/ui/alert-dialog";
import { deleteTask, archiveTask } from "../lib/api";
import PageSkeleton from '../components/PageSkeleton';

const TasksDataTable = lazy(() => import("../components/tasks/DataTable"));

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"" | "overdue" | "today" | "noAssignee">("");
  const [selected, setSelected] = useState<string[]>([]);
  const isLoading = useIsFetching({ queryKey: ["tasks"] }) > 0;
  const qc = useQueryClient();
  const { t } = useTranslation();

  const deleteMut = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteTask(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSelected([]);
    },
  });

  const archiveMut = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => archiveTask(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSelected([]);
    },
  });

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main id="main-content" className="p-4 md:ml-60 mt-14">
        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-xl font-semibold">{t('nav.tasks')}</h1>
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
                          {t('buttons.archive')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('dialogs.archiveSelected')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('messages.confirmAction')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => archiveMut.mutate(selected)}>
                            {t('buttons.archive')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          {t('buttons.delete')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('dialogs.deleteSelected')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('messages.confirmAction')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMut.mutate(selected)}>
                            {t('buttons.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                <Button
                  size="sm"
                  variant={quickFilter === "overdue" ? "default" : "outline"}
                  onClick={() =>
                    setQuickFilter((f) => (f === "overdue" ? "" : "overdue"))
                  }
                >
                  {t('filters.overdue')}
                </Button>
                <Button
                  size="sm"
                  variant={quickFilter === "today" ? "default" : "outline"}
                  onClick={() =>
                    setQuickFilter((f) => (f === "today" ? "" : "today"))
                  }
                >
                  {t('filters.today')}
                </Button>
                <Button
                  size="sm"
                  variant={quickFilter === "noAssignee" ? "default" : "outline"}
                  onClick={() =>
                    setQuickFilter((f) =>
                      f === "noAssignee" ? "" : "noAssignee"
                    )
                  }
                >
                  {t('filters.noAssignee')}
                </Button>
                <CreateTaskSheet />
              </>
            )}
          </div>
        </div>
        <Suspense fallback={<PageSkeleton />}>
          <TasksDataTable quickFilter={quickFilter} onSelectionChange={setSelected} />
        </Suspense>
      </main>
    </>
  );
}
