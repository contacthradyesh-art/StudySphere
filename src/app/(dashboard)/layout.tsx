import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { GoalReminderWatcher } from '@/components/planner/goal-reminder-watcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="ambient-glow" aria-hidden="true" />
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] min-w-0 flex-1 overflow-x-hidden px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6">{children}</main>
      </div>
      <BottomNav />
      <GoalReminderWatcher />
    </div>
  );
}