import React, { useState, Suspense, lazy } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import TasksToolbar from "../components/tasks/TasksToolbar";
import { deleteTask, archiveTask } from "../lib/api";
import PageSkeleton from '../components/PageSkeleton';

const TasksDataTable = lazy(() => import("../components/tasks/DataTable"));

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"" | "overdue" | "today" | "noAssignee">("");
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
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
        <TasksToolbar
          quickFilter={[quickFilter, setQuickFilter]}
          selected={selected}
          onArchive={(ids) => archiveMut.mutate(ids)}
          onDelete={(ids) => deleteMut.mutate(ids)}
          onCreate={() => setCreateOpen(true)}
        />
        <Suspense fallback={<PageSkeleton />}>
          <TasksDataTable
            quickFilter={quickFilter}
            onSelectionChange={setSelected}
          />
        </Suspense>
        <CreateTaskSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          showTrigger={false}
        />
      </main>
    </>
  );
}
