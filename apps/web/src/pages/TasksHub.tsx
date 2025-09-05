import React, { useState, Suspense, lazy } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, VisibilityState } from "@tanstack/react-table";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import TasksToolbar from "../components/tasks/TasksToolbar";
import FiltersDrawer from "../components/tasks/FiltersDrawer";
import TasksHubSkeleton from "../components/tasks/TasksHubSkeleton";
import { deleteTask, archiveTask, TaskFilters } from "../lib/api";

const TasksDataTable = lazy(() => import("../components/tasks/DataTable"));

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"" | "overdue" | "today" | "noAssignee">("");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: undefined,
    assignees: undefined,
    from: undefined,
    to: undefined,
  });
  const [table, setTable] = useState<Table<any>>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [view, setView] = useState<'table' | 'card'>('table');
  const qc = useQueryClient();

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
      <main
        id="main-content"
        className="mt-14 px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[16rem,1fr] lg:ml-0 w-full gap-4 sm:gap-6"
      >
        <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="flex flex-col gap-4 sm:gap-6">
          <Suspense fallback={<TasksHubSkeleton />}>
            <TasksToolbar
              quickFilter={[quickFilter, setQuickFilter]}
              selected={selected}
              onArchive={(ids) => archiveMut.mutate(ids)}
              onDelete={(ids) => deleteMut.mutate(ids)}
              onCreate={() => setCreateOpen(true)}
              onOpenFilters={() => setFiltersOpen(true)}
              search={search}
              onSearchChange={setSearch}
              table={table}
              columnVisibility={columnVisibility}
              view={view}
              setView={setView}
            />
            <TasksDataTable
              quickFilter={quickFilter}
              filters={filters}
              search={search}
              onSelectionChange={setSelected}
              onTableChange={setTable}
              onColumnVisibilityChange={setColumnVisibility}
              view={view}
            />
          </Suspense>
          <CreateTaskSheet
            open={createOpen}
            onOpenChange={setCreateOpen}
            showTrigger={false}
          />
          <FiltersDrawer
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            filters={filters}
            onChange={setFilters}
          />
        </div>
      </main>
    </>
  );
}
