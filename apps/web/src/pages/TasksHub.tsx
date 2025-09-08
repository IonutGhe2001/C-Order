import React, { useState, Suspense, lazy, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, VisibilityState } from "@tanstack/react-table";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import TasksToolbar from "../components/tasks/TasksToolbar";
import TasksHubSkeleton from "../components/tasks/TasksHubSkeleton";
import FiltersBar from "../components/tasks/FiltersBar";
import { deleteTask, archiveTask, TaskFilters } from "../lib/api";
import { createTaskColumns } from "../components/tasks/columns";
import CustomizeColumnsDialog from "../components/tasks/CustomizeColumnsDialog";
import { useTranslation } from "react-i18next";

const TasksDataTable = lazy(() => import("../components/tasks/DataTable"));

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"" | "overdue" | "today" | "noAssignee">("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: undefined,
    assignees: undefined,
    from: undefined,
    to: undefined,
  });
  const [table, setTable] = useState<Table<any>>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [view, setView] = useState<'table' | 'card'>('table');
  const [editColumnsOpen, setEditColumnsOpen] = useState(false);
  const [columnNames, setColumnNames] = useState<Record<string, string>>({});
  const [customColumns, setCustomColumns] = useState<{ id: string; header: string }[]>([]);
  const { t } = useTranslation();
  const baseColumns = useMemo(
    () =>
      createTaskColumns(t).map((c) => ({
        id: String((c as any).accessorKey || c.id),
        header:
          typeof c.header === "string"
            ? c.header
            : String((c as any).accessorKey || c.id),
      })),
    [t]
  );
  useEffect(() => {
    const names = localStorage.getItem("tasksColumnNames");
    if (names) {
      try {
        setColumnNames(JSON.parse(names));
      } catch {
        /* ignore */
      }
    }
    const custom = localStorage.getItem("tasksCustomColumns");
    if (custom) {
      try {
        setCustomColumns(JSON.parse(custom));
      } catch {
        /* ignore */
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("tasksColumnNames", JSON.stringify(columnNames));
  }, [columnNames]);
  useEffect(() => {
    localStorage.setItem("tasksCustomColumns", JSON.stringify(customColumns));
  }, [customColumns]);
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

  useEffect(() => {
    const open = () => setEditColumnsOpen(true);
    window.addEventListener("open-customize-columns", open as any);
    return () => window.removeEventListener("open-customize-columns", open as any);
  }, []);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main
        id="main-content"
        className="pt-14 ml-0 px-4 sm:px-6 lg:px-8 w-full md:ml-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]"
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          <Suspense fallback={<TasksHubSkeleton />}>
            <TasksToolbar
              quickFilter={[quickFilter, setQuickFilter]}
              onCreate={() => setCreateOpen(true)}
              search={search}
              onSearchChange={setSearch}
              table={table}
              columnVisibility={columnVisibility}
              view={view}
              setView={setView}
              onOpenEditColumns={() => setEditColumnsOpen(true)}
            />
            <FiltersBar filters={filters} onChange={setFilters} />
            <TasksDataTable
              quickFilter={quickFilter}
              filters={filters}
              search={search}
              onTableChange={setTable}
              onColumnVisibilityChange={setColumnVisibility}
              onArchive={(ids) => archiveMut.mutate(ids)}
              onDelete={(ids) => deleteMut.mutate(ids)}
              view={view}
              columnNames={columnNames}
              customColumns={customColumns}
            />
          </Suspense>
          <CreateTaskSheet
            open={createOpen}
            onOpenChange={setCreateOpen}
            showTrigger={false}
          />
          <CustomizeColumnsDialog
            open={editColumnsOpen}
            onOpenChange={setEditColumnsOpen}
            columns={baseColumns}
            customColumns={customColumns}
            columnNames={columnNames}
            onSave={(names, cols) => {
              setColumnNames(names);
              setCustomColumns(cols);
            }}
          />
        </div>
      </main>
    </>
  );
}
