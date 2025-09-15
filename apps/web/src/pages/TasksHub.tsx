import React, { useState, Suspense, lazy, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, VisibilityState } from "@tanstack/react-table";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import TasksHubSkeleton from "../components/tasks/TasksHubSkeleton";
import FiltersBar from "../components/tasks/FiltersBar";
import CustomizeColumnsDialog from "../components/tasks/CustomizeColumnsDialog";
import { deleteTask, archiveTask, TaskFilters, listCustomFields } from "../lib/api";

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
  const [customFields, setCustomFields] = useState<{ id: string; header: string }[]>([]);
  const [customIds, setCustomIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("tasksCustomColumns");
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
    () => customFields.filter((f) => customIds.includes(f.id)),
    [customFields, customIds]
  );
  useEffect(() => {
    listCustomFields()
      .then((fields) => {
        const cols = fields.map((f: any) => ({ id: f.id, header: f.label }));
        setCustomFields(cols);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    localStorage.setItem("tasksCustomColumns", JSON.stringify(customIds));
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

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        table={table}
        columnVisibility={columnVisibility}
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
            available={customFields}
            selected={customIds}
            onSave={setCustomIds}
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
