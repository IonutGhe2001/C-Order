import React, { useState, Suspense, lazy, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, VisibilityState } from "@tanstack/react-table";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import TasksHubSkeleton from "../components/tasks/TasksHubSkeleton";
import FiltersBar from "../components/tasks/FiltersBar";
import CustomizeColumnsDialog from "../components/tasks/CustomizeColumnsDialog";
import { deleteTask, archiveTask, TaskFilters } from "../lib/api";
import { useTranslation } from "react-i18next";

const TasksDataTable = lazy(() => import("../components/tasks/DataTable"));

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    q: undefined,
    status: undefined,
    assignees: undefined,
    from: undefined,
    to: undefined,
    priority: undefined,
  });
  const resetFilters = () =>
    setFilters({
      q: undefined,
      status: undefined,
      assignees: undefined,
      from: undefined,
      to: undefined,
      priority: undefined,
    });
  const [table, setTable] = useState<Table<any>>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [view, setView] = useState<'table' | 'card'>(() =>
    (localStorage.getItem('tasksView') as 'table' | 'card') || 'table'
  );
  const { t } = useTranslation();
  const baseColumns = useMemo(
    () => [
      { id: 'title', header: t('labels.title') },
      { id: 'status', header: t('labels.status') },
      { id: 'priority', header: t('labels.priority') },
      { id: 'createdAt', header: t('labels.createdAt') },
      { id: 'dueDate', header: t('labels.dueDate') },
      { id: 'assignees', header: t('labels.assignees') },
    ],
    [t]
  );
  const extraColumns = useMemo(
    () => [
      { id: 'orderDate', header: t('labels.orderDate') },
      { id: 'orderReceivedDate', header: t('labels.orderReceivedDate') },
      { id: 'orderNumber', header: t('labels.orderNumber') },
      { id: 'authority', header: t('labels.authority') },
      { id: 'orderType', header: t('labels.orderType') },
      { id: 'productsReceivedDate', header: t('labels.productsReceivedDate') },
      { id: 'deliveryDate', header: t('labels.deliveryDate') },
      { id: 'supplier', header: t('labels.supplier') },
    ],
    [t]
  );
  const [customIds, setCustomIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('tasksCustomColumns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
  return [];
  });
  const customColumns = useMemo(
    () => extraColumns.filter((f) => customIds.includes(f.id)),
    [extraColumns, customIds]
  );
  useEffect(() => {
    localStorage.setItem('tasksCustomColumns', JSON.stringify(customIds));
  }, [customIds]);
  useEffect(() => {
    localStorage.setItem('tasksView', view);
  }, [view]);
  const qc = useQueryClient();

  const deleteMut = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteTask(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const archiveMut = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => archiveTask(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const availableColumns = useMemo(
    () => [...baseColumns, ...extraColumns],
    [baseColumns, extraColumns]
  );
  const selectedColumns = useMemo(
    () => [
      ...baseColumns
        .map((c) => c.id)
        .filter((id) => columnVisibility[id] !== false),
      ...customIds,
    ],
    [baseColumns, columnVisibility, customIds]
  );
  const handleSaveColumns = (ids: string[]) => {
    const visibility: VisibilityState = {};
    const baseIds = baseColumns.map((c) => c.id);
    const extraIds = extraColumns.map((c) => c.id);
    [...baseIds, ...extraIds].forEach((id) => {
      visibility[id] = ids.includes(id);
    });
    table?.setColumnVisibility(visibility);
    setColumnVisibility(visibility);
    setCustomIds(ids.filter((id) => extraIds.includes(id)));
  };

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        view={view}
        setView={setView}
      />
        <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main
        id="main-content"
        className="pt-14 ml-0 px-4 sm:px-6 lg:px-8 w-full md:ml-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]"
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          <Suspense fallback={<TasksHubSkeleton />}>
            <FiltersBar
              filters={filters}
              onChange={setFilters}
              onCreate={() => setCreateOpen(true)}
              view={view}
              onViewChange={setView}
              onCustomizeColumns={() => setColumnsDialogOpen(true)}
            />
            <TasksDataTable
              filters={filters}
              onTableChange={setTable}
              onColumnVisibilityChange={setColumnVisibility}
              onArchive={(ids) => archiveMut.mutate(ids)}
              onDelete={(ids) => deleteMut.mutate(ids)}
              view={view}
              customColumns={customColumns}
              onResetFilters={resetFilters}
            />
          </Suspense>
          <CustomizeColumnsDialog
            open={columnsDialogOpen}
            onOpenChange={setColumnsDialogOpen}
            available={availableColumns}
            selected={selectedColumns}
            onSave={handleSaveColumns}
          />
          <CreateTaskSheet
            open={createOpen}
            onOpenChange={setCreateOpen}
            showTrigger={false}
          />
        </div>
      </main>
    </>
  );
}
