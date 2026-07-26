"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";

interface StudyStatsCardProps { stats: { todayMinutes: number; weekMinutes: number; monthMinutes: number; testsThisWeek: number; cardsReviewed: number; }; }

export function StudyStatsCard({ stats }: StudyStatsCardProps) {
  const statItems = [
    { label: "Today", value: `${Math.floor(stats.todayMinutes / 60)}h ${stats.todayMinutes % 60}m`, icon: "⏱️", color: "text-electric-300" },
    { label: "This Week", value: `${Math.floor(stats.weekMinutes / 60)}h`, icon: "📅", color: "text-neon-300" },
    { label: "Tests", value: stats.testsThisWeek.toString(), icon: "📝", color: "text-orange-300" },
    { label: "Cards Reviewed", value: stats.cardsReviewed.toString(), icon: "🃏", color: "text-purple-300" },
  ];
  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4"><span className="text-lg">📊</span><h3 className="text-sm font-semibold text-charcoal-100">Quick Stats</h3></div>
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }} className="rounded-xl bg-charcoal-800/40 border border-charcoal-700/20 p-3 text-center">
            <span className="text-lg block mb-1">{item.icon}</span>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
