"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { FlameIcon } from "@/components/shared/icons";
import type { StreakDisplay, BufferDayInfo } from "../types";

interface StreakCardProps { streak: StreakDisplay; bufferDays: BufferDayInfo; }

export function StreakCard({ streak, bufferDays }: StreakCardProps) {
  return (
    <Card variant="glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><FlameIcon size={20} className="text-orange-400" /><h3 className="text-sm font-semibold text-charcoal-100">Study Streak</h3></div>
        <div className="text-right"><p className="text-2xl font-bold text-orange-400">{streak.current}</p><p className="text-[10px] text-charcoal-500">days</p></div>
      </div>
      <div className="flex items-center justify-between gap-1 mb-4">
        {streak.weekHistory.map((day, index) => (
          <motion.div key={day.date} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.05 }} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${day.active ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : day.bufferUsed ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-charcoal-800/50 text-charcoal-600 border border-charcoal-700/30"}`}>
              {day.active ? "✓" : day.bufferUsed ? "B" : "·"}
            </div>
            <span className="text-[10px] text-charcoal-500">{day.day}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-charcoal-700/30">
        <div><p className="text-xs text-charcoal-500">Longest</p><p className="text-sm font-semibold text-charcoal-200">{streak.longest} days</p></div>
        <div className="text-right">
          <p className="text-xs text-charcoal-500">Buffer Days</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: bufferDays.total }).map((_, i) => <div key={i} className={`w-3 h-3 rounded-full ${i < bufferDays.remaining ? "bg-yellow-400" : "bg-charcoal-700"}`} />)}
            <span className="text-xs text-charcoal-400 ml-1">{bufferDays.remaining}/{bufferDays.total}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
