import Header from "../Header";
import Sidebar from "../Sidebar";
import TaskDetailSkeleton from "./TaskDetailSkeleton";

export default function TaskDetailPageSkeleton() {
  return (
    <>
      <Header onToggleSidebar={() => {}} />
      <Sidebar />
      <main
        id="main-content"
        className="pt-14 ml-0 px-4 sm:px-6 lg:px-8 w-full md:ml-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]"
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          <TaskDetailSkeleton />
        </div>
      </main>
    </>
  );
}