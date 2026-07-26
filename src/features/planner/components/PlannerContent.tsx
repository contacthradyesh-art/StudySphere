"use client";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Tabs } from "@/components/shared/Tabs";
import { showToast } from "@/components/shared/Toast";
import { cn } from "@/utils/cn";
import { getMockWeeklyPlan, getMockMissions } from "../utils/mockPlannerData";

const viewTabs = [{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }, { id: "mission", label: "Missions" }];
const taskTypeIcons: Record<string, string> = { study: "📖", revision: "🔄", "mock-test": "📝", "flashcard-review": "🃏", practice: "✏️", break: "☕" };

export function PlannerContent() {
  const [activeView, setActiveView] = useState("daily");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const weeklyPlan = useMemo(() => getMockWeeklyPlan(), []);
  const missions = useMemo(() => getMockMissions(), []);
  const todayPlan = weeklyPlan.days[selectedDayIndex];

  const handleToggleTask = useCallback((taskId: string) => { showToast("Task status updated!", "success"); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Planner</h2><p className="text-charcoal-400 text-sm">Plan your study schedule</p></div>
        <Button variant="neon" size="sm">🤖 AI Plan</Button>
      </div>

      <Tabs tabs={viewTabs} activeTab={activeView} onChange={setActiveView} />

      {activeView === "daily" && todayPlan && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {weeklyPlan.days.map((day, idx) => (
              <button key={day.date} onClick={() => setSelectedDayIndex(idx)}
                className={cn("flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border", idx === selectedDayIndex ? "bg-electric/20 border-electric/30 text-electric-300" : "bg-charcoal-900/40 border-charcoal-700/30 text-charcoal-400 hover:text-charcoal-200", day.isBufferDay && "border-yellow-500/20")}>
                <p className="text-xs">{day.dayLabel}</p>{day.isBufferDay && <span className="text-[10px] text-yellow-400">Buffer</span>}
              </button>
            ))}
          </div>
          <Card variant="glass" padding="sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-charcoal-200">{todayPlan.tasks.filter((t) => t.status === "completed").length}/{todayPlan.tasks.length} tasks</p><p className="text-xs text-charcoal-500">{Math.floor(todayPlan.totalMinutes / 60)}h {todayPlan.totalMinutes % 60}m planned</p></div>
              <ProgressRing value={todayPlan.totalMinutes > 0 ? (todayPlan.completedMinutes / todayPlan.totalMinutes) * 100 : 0} size={50} strokeWidth={4} variant="electric" />
            </div>
          </Card>
          <div className="space-y-2">
            {todayPlan.tasks.map((task, idx) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card variant={task.status === "completed" ? "default" : "glass"} padding="sm" className={cn(task.status === "completed" && "opacity-60")}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleTask(task.id)} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors", task.status === "completed" ? "border-neon bg-neon/20 text-neon" : "border-charcoal-600 hover:border-electric")}>
                      {task.status === "completed" && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{taskTypeIcons[task.type]}</span>
                        <p className={cn("text-sm font-medium truncate", task.status === "completed" ? "line-through text-charcoal-500" : "text-charcoal-100")}>{task.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.startTime && <span className="text-[10px] text-charcoal-500">{task.startTime}</span>}
                        <span className="text-[10px] text-charcoal-600">{task.durationMinutes}m</span>
                        {task.isAiSuggested && <Badge variant="electric" size="sm">AI</Badge>}
                        {task.isBufferDay && <Badge variant="warning" size="sm">Buffer</Badge>}
                      </div>
                    </div>
                    <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"} size="sm">{task.priority}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeView === "weekly" && (
        <div className="space-y-3">
          {weeklyPlan.days.map((day, idx) => {
            const completedCount = day.tasks.filter((t) => t.status === "completed").length;
            const progress = day.tasks.length > 0 ? (completedCount / day.tasks.length) * 100 : 0;
            return (
              <motion.div key={day.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card variant={day.isToday ? "glow" : "glass"} padding="sm" hoverable onClick={() => { setSelectedDayIndex(idx); setActiveView("daily"); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold", day.isToday ? "bg-electric/20 text-electric-300" : "bg-charcoal-800/50 text-charcoal-400")}>{new Date(day.date).getDate()}</div>
                      <div><p className="text-sm font-medium text-charcoal-100">{day.dayLabel}{day.isBufferDay && <span className="text-yellow-400 ml-2 text-xs">Buffer Day</span>}</p><p className="text-xs text-charcoal-500">{day.tasks.length} tasks · {Math.floor(day.totalMinutes / 60)}h {day.totalMinutes % 60}m</p></div>
                    </div>
                    <ProgressRing value={progress} size={40} strokeWidth={3} variant={progress === 100 ? "neon" : "electric"} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeView === "mission" && (
        <div className="space-y-4">
          {missions.map((mission, idx) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Card variant="glass">
                <div className="flex items-start justify-between mb-3">
                  <div><h4 className="text-base font-semibold text-charcoal-50">{mission.title}</h4><p className="text-xs text-charcoal-500">{mission.description}</p></div>
                  <Badge variant={mission.status === "active" ? "neon" : "default"} size="sm">{mission.status}</Badge>
                </div>
                <ProgressBar value={mission.progress} variant="gradient" size="md" showLabel label="Progress" className="mb-4" />
                <div className="space-y-2">
                  {mission.milestones.map((ms) => (
                    <div key={ms.id} className={cn("flex items-center gap-3 rounded-lg px-3 py-2", ms.completed ? "bg-neon/5" : "bg-charcoal-800/30")}>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0", ms.completed ? "border-neon bg-neon/20 text-neon" : "border-charcoal-600")}>{ms.completed && <span className="text-[10px]">✓</span>}</div>
                      <div className="flex-1"><p className={cn("text-sm", ms.completed ? "text-charcoal-500 line-through" : "text-charcoal-200")}>{ms.title}</p><p className="text-[10px] text-charcoal-600">Target: {ms.targetDate}</p></div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
