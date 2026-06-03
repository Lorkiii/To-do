import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AddTaskModal } from "@/components/features/tasks/addTaskModal";
import TaskList from "@/components/features/tasks/taskList";
import { DashboardSidebar } from "@/components/layout/dashboardSidebar";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { listTasks } from "@/services/taskService";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const tasks = await listTasks(userId);

  return (
    <DashboardSidebar activeItemId="tasks">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-border bg-card/70 p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">Tasks</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Task List
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review, edit, and clean up your active tasks in one place.
            </p>
          </div>
          <AddTaskModal
            trigger={
              <Button type="button" className="h-10 rounded-xl px-4">
                Add task
              </Button>
            }
          />
        </header>

        <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
          <TaskList tasks={tasks} />
        </section>
      </div>
    </DashboardSidebar>
  );
}
