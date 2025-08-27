import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TasksDataTable from "../components/tasks/DataTable";
import CreateTaskSheet from "../components/tasks/CreateTaskSheet";

export default function TasksHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <div className="p-4 md:ml-60 mt-14">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">Tasks</h1>
          <CreateTaskSheet />
        </div>
        <TasksDataTable />
      </div>
    </>
  );
}
