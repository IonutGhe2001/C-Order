import React, { useState, Suspense, lazy } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [createOpen, setCreateOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    assignees: [],
    from: undefined,
    to: undefined,
  });
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
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main
        id="main-content"
        className="mt-14 px-4 sm:px-6 lg:px-8 lg:ml-60 flex flex-col gap-4"
      >
        <Suspense fallback={<TasksHubSkeleton />}>
          <TasksToolbar
            quickFilter={[quickFilter, setQuickFilter]}
            selected={selected}
            onArchive={(ids) => archiveMut.mutate(ids)}
            onDelete={(ids) => deleteMut.mutate(ids)}
            onCreate={() => setCreateOpen(true)}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          <TasksDataTable
            quickFilter={quickFilter}
            filters={filters}
            onSelectionChange={setSelected}
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
      </main>
    </>
  );
}
