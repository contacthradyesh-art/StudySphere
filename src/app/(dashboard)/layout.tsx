import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { GoalReminderWatcher } from '@/components/planner/goal-reminder-watcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="ambient-glow" aria-hidden="true" />
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
      <GoalReminderWatcher />
    </div>
  );
}