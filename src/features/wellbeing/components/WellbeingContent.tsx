"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { showToast } from "@/components/shared/Toast";
import { cn } from "@/utils/cn";
import { getMockWellbeingData } from "../utils/mockWellbeingData";
import type { Mood, FocusSession } from "../types";

const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  great: { emoji: "😄", label: "Great", color: "text-neon" }, good: { emoji: "🙂", label: "Good", color: "text-electric-300" },
  okay: { emoji: "😐", label: "Okay", color: "text-yellow-400" }, low: { emoji: "😔", label: "Low", color: "text-orange-400" },
  stressed: { emoji: "😰", label: "Stressed", color: "text-red-400" },
};

export function WellbeingContent() {
  const data = useMemo(() => getMockWellbeingData(), []);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(data.todayMood?.mood || null);
  const [focusState, setFocusState] = useState<FocusSession["status"]>("idle");
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const focusProgress = focusDuration > 0 ? (focusSeconds / (focusDuration * 60)) * 100 : 0;

  useEffect(() => {
    if (focusState === "active") {
      timerRef.current = setInterval(() => {
        setFocusSeconds((prev) => {
          if (prev >= focusDuration * 60 - 1) { setFocusState("completed"); showToast("Focus session complete! Take a break 🎉", "success"); return focusDuration * 60; }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [focusState, focusDuration]);

  const handleStartFocus = useCallback(() => { setFocusSeconds(0); setFocusState("active"); }, []);
  const handlePauseFocus = useCallback(() => { setFocusState((s) => (s === "active" ? "paused" : "active")); }, []);
  const handleResetFocus = useCallback(() => { setFocusState("idle"); setFocusSeconds(0); }, []);
  const handleMoodSelect = useCallback((mood: Mood) => { setSelectedMood(mood); showToast(`Mood logged: ${moodConfig[mood].label}`, "success"); }, []);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60); const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Wellbeing</h2><p className="text-charcoal-400 text-sm">Take care of yourself while preparing</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-4"><span className="text-lg">💭</span><h3 className="text-sm font-semibold text-charcoal-100">How are you feeling?</h3></div>
          <div className="flex justify-between gap-2 mb-4">
            {(Object.entries(moodConfig) as [Mood, typeof moodConfig[Mood]][]).map(([mood, config]) => (
              <button key={mood} onClick={() => handleMoodSelect(mood)} className={cn("flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all", selectedMood === mood ? "bg-electric/15 border-electric/30 scale-105" : "bg-charcoal-800/30 border-charcoal-700/20 hover:border-charcoal-600")}>
                <span className="text-2xl">{config.emoji}</span><span className="text-[10px] text-charcoal-400">{config.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-charcoal-700/30">
            <p className="text-xs text-charcoal-500 mb-2">This week</p>
            <div className="flex justify-between">
              {data.moodHistory.map((entry) => {
                const config = moodConfig[entry.mood];
                return (<div key={entry.id} className="flex flex-col items-center gap-1"><span className="text-lg">{config.emoji}</span><span className="text-[10px] text-charcoal-600">{new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short" })}</span></div>);
              })}
            </div>
          </div>
        </Card>

        <Card variant={focusState === "active" ? "glow" : "glass"}>
          <div className="flex items-center gap-2 mb-4"><span className="text-lg">🎯</span><h3 className="text-sm font-semibold text-charcoal-100">Focus Session</h3></div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <ProgressRing value={focusProgress} size={140} strokeWidth={8} variant={focusState === "completed" ? "neon" : "electric"} showValue={false} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-mono font-bold text-charcoal-50">{formatTimer(focusState === "idle" ? focusDuration * 60 : focusDuration * 60 - focusSeconds)}</p>
                <p className="text-xs text-charcoal-500">{focusState === "idle" ? "Ready" : focusState === "active" ? "Focusing..." : focusState === "paused" ? "Paused" : "Done!"}</p>
              </div>
            </div>
            {focusState === "idle" && (
              <div className="flex gap-2">
                {[15, 25, 45].map((mins) => (
                  <button key={mins} onClick={() => setFocusDuration(mins)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", focusDuration === mins ? "bg-electric/20 border-electric/30 text-electric-300" : "bg-charcoal-800/50 border-charcoal-700/30 text-charcoal-400")}>{mins}m</button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {focusState === "idle" && <Button variant="primary" size="sm" onClick={handleStartFocus}>Start Focus</Button>}
              {(focusState === "active" || focusState === "paused") && (<><Button variant="secondary" size="sm" onClick={handlePauseFocus}>{focusState === "active" ? "Pause" : "Resume"}</Button><Button variant="ghost" size="sm" onClick={handleResetFocus}>Reset</Button></>)}
              {focusState === "completed" && <Button variant="neon" size="sm" onClick={handleResetFocus}>New Session</Button>}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-3"><span className="text-lg">☕</span><h3 className="text-sm font-semibold text-charcoal-100">Break Reminder</h3></div>
          <p className="text-sm text-charcoal-300 mb-3">Gentle reminders to take breaks every <strong className="text-electric-300">{data.breakReminder.intervalMinutes} minutes</strong>.</p>
          <p className="text-xs text-charcoal-500">Your brain needs rest to consolidate learning. Short breaks improve focus and retention.</p>
          <div className="mt-3 pt-3 border-t border-charcoal-700/30"><Badge variant={data.breakReminder.enabled ? "neon" : "default"} size="sm">{data.breakReminder.enabled ? "Active" : "Disabled"}</Badge></div>
        </Card>
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-3"><span className="text-lg">📊</span><h3 className="text-sm font-semibold text-charcoal-100">Wellbeing Stats</h3></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-charcoal-800/40 p-3 text-center"><p className="text-lg font-bold text-electric-300">{data.stats.totalFocusMinutesToday}m</p><p className="text-[10px] text-charcoal-500">Focus Today</p></div>
            <div className="rounded-xl bg-charcoal-800/40 p-3 text-center"><p className="text-lg font-bold text-neon">{Math.floor(data.stats.totalFocusMinutesWeek / 60)}h</p><p className="text-[10px] text-charcoal-500">Focus This Week</p></div>
            <div className="rounded-xl bg-charcoal-800/40 p-3 text-center"><p className="text-lg font-bold text-yellow-400">{data.stats.moodAverage.toFixed(1)}/5</p><p className="text-[10px] text-charcoal-500">Mood Average</p></div>
            <div className="rounded-xl bg-charcoal-800/40 p-3 text-center"><p className="text-lg font-bold text-orange-300">{data.stats.streakDaysWithMoodLog}d</p><p className="text-[10px] text-charcoal-500">Mood Streak</p></div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
