"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { usePlannerV2 } from "@/features/planner/hooks/usePlannerV2";

type Mode = "student" | "professional";
type ViewMode = "day" | "week" | "month";
type Priority = "High" | "Medium" | "Low";

type TaskItem = {
  id: string;
  title: string;
  time: string;
  priority: Priority;
  done: boolean;
  tag: string;
};

const initialTasks: TaskItem[] = [
  { id: "task-1", title: "Maths Class - 9 AM", time: "09:00", priority: "High", done: false, tag: "Study" },
  { id: "task-2", title: "Meeting - 2 PM", time: "14:00", priority: "Medium", done: false, tag: "Work" },
  { id: "task-3", title: "Revision Sprint - 7 PM", time: "19:00", priority: "Low", done: true, tag: "Focus" },
];

const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarDates = [29, 30, 1, 2, 3, 4, 5];

function IconWrapper({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric">{children}</span>;
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 18h20" />
      <path d="M8 20h8" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9L12 3Z" />
    </svg>
  );
}

function PlannerContent() {
  const planner = usePlannerV2();
  const [mode, setMode] = useState<Mode>("student");
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [selectedTag, setSelectedTag] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [waterIntake, setWaterIntake] = useState(60);
  const [exercise, setExercise] = useState(40);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const tagMatch = selectedTag === "All" || task.tag === selectedTag;
      const queryMatch = task.title.toLowerCase().includes(query.toLowerCase());
      return tagMatch && queryMatch;
    });
  }, [query, selectedTag, tasks]);

  const completedCount = tasks.filter((task) => task.done).length;
  const completionRate = Math.round((completedCount / Math.max(tasks.length, 1)) * 100);
  const focusMinutes = Math.max(25, Math.round(timeLeft / 60));

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const priorityTone: Record<Priority, string> = {
    High: "text-rose-300",
    Medium: "text-amber-300",
    Low: "text-emerald-300",
  };

  const topSummary = [
    { label: "Today", value: "7.5h" },
    { label: "Focus", value: `${planner.currentStreak} day` },
    { label: "XP", value: `${planner.totalXp}` },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        <header className="mb-5 rounded-[28px] border border-slate-800/80 bg-slate-950/70 px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-electric">Hybrid Planner App</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">Premium daily operating system</h1>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-2">
              <span className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${mode === "student" ? "text-electric" : "text-slate-400"}`}>Student</span>
              <button
                type="button"
                aria-label="Toggle planner mode"
                onClick={() => setMode((current) => (current === "student" ? "professional" : "student"))}
                className="relative h-8 w-16 rounded-full bg-slate-800 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-gradient-to-r from-electric to-teal-400 transition-all duration-300 ${mode === "student" ? "left-1" : "left-9"}`}
                />
              </button>
              <span className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${mode === "professional" ? "text-teal-300" : "text-slate-400"}`}>Professional</span>
            </div>

            <div className="flex gap-2">
              {topSummary.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          <aside className={`space-y-4 transition-all duration-300 ${mode === "student" ? "opacity-100" : "opacity-60"}`}>
            <Card variant="glass" padding="md" className="border border-electric/20 shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_0_30px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Time-Table</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">10 AM: History</h3>
                </div>
                <IconWrapper><BookIcon /></IconWrapper>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-300">Smart chapter block with revision pacing.</div>
            </Card>

            <Card variant="glass" padding="md" className="border border-electric/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Exam Tracker</p>
                  <h3 className="mt-2 text-base font-semibold text-white">Maths Exam - Oct 12</h3>
                </div>
                <Badge variant="neon" size="sm">60%</Badge>
              </div>
              <div className="mt-4">
                <ProgressBar value={60} variant="gradient" showLabel label="Target progress" />
              </div>
            </Card>

            <Card variant="glass" padding="md" className="border border-electric/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Study Goals</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Daily: 8 Hrs Padho</h3>
                </div>
                <div className="rounded-full bg-neon/15 px-3 py-1 text-xs text-neon">Goal</div>
              </div>
            </Card>
          </aside>

          <main className="space-y-4">
            <Card variant="glass" padding="md" className="border border-slate-800/70 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Tasks list</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">TO-DO LIST</h2>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search tasks"
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-0 sm:w-60"
                  />
                  <select
                    value={selectedTag}
                    onChange={(event) => setSelectedTag(event.target.value)}
                    className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none"
                  >
                    <option>All</option>
                    <option>Study</option>
                    <option>Work</option>
                    <option>Focus</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/55 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} className="h-4 w-4 rounded" />
                      <div>
                        <p className="text-sm font-medium text-white">{task.title}</p>
                        <p className="text-xs text-slate-400">{task.time} • {task.tag}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${priorityTone[task.priority]}`}>
                        <StarIcon filled={task.priority === "High"} />
                        {task.priority}
                      </span>
                      <Badge variant={task.done ? "neon" : "outline"} size="sm">{task.done ? "Done" : "Pending"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="glass" padding="md" className="border border-slate-800/70">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Calendar view</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">CALENDAR VIEW</h2>
                </div>
                <div className="flex gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 p-1">
                  {(["day", "week", "month"] as ViewMode[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setViewMode(tab)}
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition ${viewMode === tab ? "bg-electric text-white" : "text-slate-400"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-800/60 bg-slate-950/60 p-3">
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {calendarDays.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {calendarDates.map((day, index) => (
                    <div
                      key={`${day}-${index}`}
                      className={`rounded-2xl border p-3 text-center ${index === 2 ? "border-electric/40 bg-electric/10 text-white" : "border-slate-800 bg-slate-900/60 text-slate-300"}`}
                    >
                      <span className="block text-lg font-semibold">{day}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-slate-500">{index === 2 ? "focus" : "free"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Reminders</p>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-3 py-3 text-sm text-red-200">
                  <div className="flex items-center gap-2"><BellIcon /><span>Exam drop-in tomorrow at 8 AM</span></div>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-3 text-sm text-amber-200">
                  <div className="flex items-center gap-2"><ClockIcon /><span>Hydration reminder: 30 mins left</span></div>
                </div>
              </div>
            </Card>
          </main>

          <aside className={`space-y-4 transition-all duration-300 ${mode === "professional" ? "opacity-100" : "opacity-60"}`}>
            <Card variant="glass" padding="md" className="border border-teal-400/20 shadow-[0_0_0_1px_rgba(45,212,191,0.12),0_0_30px_rgba(45,212,191,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Project Milestones</p>
                  <h3 className="mt-2 text-base font-semibold text-white">Client Presentation: Friday</h3>
                </div>
                <IconWrapper><LaptopIcon /></IconWrapper>
              </div>
            </Card>

            <Card variant="glass" padding="md" className="border border-teal-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Daily Routine</p>
                  <h3 className="mt-2 text-base font-semibold text-white">Meditation: 7 AM</h3>
                </div>
                <IconWrapper><ClockIcon /></IconWrapper>
              </div>
            </Card>

            <Card variant="glass" padding="md" className="border border-teal-400/20">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Habit Tracker</p>
                <span className="text-xs text-white">Live</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-white">
                    <span>Water Intake</span>
                    <span>{waterIntake}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={waterIntake} onChange={(event) => setWaterIntake(Number(event.target.value))} className="w-full accent-electric" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-white">
                    <span>Exercise</span>
                    <span>{exercise}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={exercise} onChange={(event) => setExercise(Number(event.target.value))} className="w-full accent-teal-400" />
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card variant="glass" padding="md" className="border border-slate-800/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Focus Mode</p>
                <h3 className="mt-1 text-xl font-semibold text-white">25:00 min</h3>
              </div>
              <Button variant="neon" size="sm" onClick={() => setIsRunning((current) => !current)}>
                {isRunning ? "Pause" : "Start"}
              </Button>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-300">
              {timeLeft === 0 ? "Session complete. Ready for the next block." : `Remaining: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
            </div>
          </Card>

          <Card variant="glass" padding="md" className="border border-slate-800/70">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Analytics</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Weekly Report</h3>
              <p className="mt-1 text-sm text-slate-300">{completionRate}% Tasks Done!</p>
            </div>
            <div className="flex h-32 items-end gap-2">
              {[55, 78, 62, 88, 74, 92, 81].map((value, index) => (
                <div key={value + index} className="flex-1 rounded-t-xl bg-gradient-to-t from-electric to-teal-400/90" style={{ height: `${value}%` }} />
              ))}
            </div>
          </Card>

          <Card variant="glass" padding="md" className="border border-slate-800/70">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Simple UI Layout</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Minimalist by design</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-3xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="col-span-2 rounded-2xl bg-electric/10 p-4 text-center text-xs text-electric">Main panel</div>
              <div className="rounded-2xl bg-teal-400/10 p-4 text-center text-xs text-teal-300">Wing</div>
              <div className="col-span-3 rounded-2xl bg-slate-900/70 p-4 text-center text-xs text-slate-400">Structured cards with breathing room</div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

export { PlannerContent };

