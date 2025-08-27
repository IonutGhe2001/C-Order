import React, { useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TasksDataTable from "../components/tasks/DataTable";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"" | "overdue" | "today" | "noAssignee">("");
  const isLoading = useIsFetching({ queryKey: ["tasks"] }) > 0;

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <div className="p-4 md:ml-60 mt-14">
        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-xl font-semibold">Tasks</h1>
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
                <Button
                  size="sm"
                  variant={quickFilter === "overdue" ? "default" : "outline"}
                  onClick={() =>
                    setQuickFilter((f) => (f === "overdue" ? "" : "overdue"))
                  }
                >
                  Overdue
                </Button>
                <Button
                  size="sm"
                  variant={quickFilter === "today" ? "default" : "outline"}
                  onClick={() =>
                    setQuickFilter((f) => (f === "today" ? "" : "today"))
                  }
                >
                  Today
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
                  No assignee
                </Button>
                <CreateTaskSheet />
              </>
            )}
          </div>
        </div>
        <TasksDataTable quickFilter={quickFilter} />
      </div>
    </>
  );
}
