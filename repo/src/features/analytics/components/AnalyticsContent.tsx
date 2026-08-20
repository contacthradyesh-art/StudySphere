"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { BarChart, DonutChart, Sparkline } from "@/components/shared/Charts";
import { cn } from "@/utils/cn";
import { getMockAnalyticsData } from "../utils/mockAnalyticsData";

const intensityColors: Record<string, string> = {
  critical: "bg-red-500/30 border-red-500/40 text-red-300", high: "bg-orange-500/20 border-orange-500/30 text-orange-300",
  medium: "bg-yellow-500/15 border-yellow-500/25 text-yellow-300", low: "bg-neon/10 border-neon/20 text-neon-300",
};

export function AnalyticsContent() {
  const data = useMemo(() => getMockAnalyticsData(), []);
  const statCards = [
    { label: "Predicted Score", value: `${data.predictedScore}/200`, variant: "electric" as const, icon: "🎯" },
    { label: "Accuracy", value: `${data.accuracy}%`, variant: data.accuracy >= 70 ? "neon" as const : "electric" as const, icon: "✅" },
    { label: "Speed", value: `${data.speed}%`, variant: "electric" as const, icon: "⚡" },
    { label: "Negative Marks", value: `-${data.negativeMarks}`, variant: "danger" as const, icon: "❌" },
    { label: "Retention", value: `${data.retentionRate}%`, variant: "neon" as const, icon: "🧠" },
    { label: "Revision Health", value: `${data.revisionHealth}%`, variant: data.revisionHealth >= 60 ? "electric" as const : "warning" as const, icon: "🔄" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Analytics</h2><p className="text-charcoal-400 text-sm">Track your performance and progress</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card variant="glass" padding="sm" className="text-center">
              <span className="text-lg block mb-1">{stat.icon}</span>
              <p className={cn("text-xl font-bold", stat.variant === "neon" ? "text-neon" : stat.variant === "danger" ? "text-red-400" : stat.variant === "warning" ? "text-yellow-400" : "text-electric-300")}>{stat.value}</p>
              <p className="text-[10px] text-charcoal-500 mt-0.5">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="glass">
          <h4 className="text-sm font-semibold text-charcoal-200 mb-4">Test Score Trend</h4>
          <Sparkline data={data.recentTestScores} color="#007edc" height={80} />
          <div className="flex justify-between mt-2 text-[10px] text-charcoal-500"><span>8 tests ago</span><span>Latest</span></div>
        </Card>
        <Card variant="glass">
          <h4 className="text-sm font-semibold text-charcoal-200 mb-4">Subject Accuracy</h4>
          <DonutChart segments={data.subjectAccuracy.map((s) => ({ label: s.subject, value: s.accuracy, color: s.color }))} size={100} strokeWidth={10} centerValue={`${data.accuracy}%`} centerLabel="Overall" className="mx-auto mb-4" />
          <div className="space-y-2">
            {data.subjectAccuracy.map((s) => (
              <div key={s.subject} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-xs text-charcoal-300">{s.subject}</span></div>
                <span className="text-xs font-medium text-charcoal-200">{s.accuracy}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="glass">
        <h4 className="text-sm font-semibold text-charcoal-200 mb-4">Study Trends (14 days)</h4>
        <BarChart data={data.studyTrends.map((t) => ({ label: new Date(t.date).getDate().toString(), value: t.studyMinutes, color: t.studyMinutes >= 120 ? "#00e805" : t.studyMinutes >= 60 ? "#007edc" : "#ff4757" }))} height={100} showValues={false} />
        <p className="text-[10px] text-charcoal-500 mt-2 text-center">Daily study minutes</p>
      </Card>

      <Card variant="glass">
        <h4 className="text-sm font-semibold text-charcoal-200 mb-4">Weak Topic Heatmap</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {data.weakTopicHeatmap.map((entry) => (
            <div key={entry.topic} className={cn("rounded-xl border p-3 text-center transition-colors", intensityColors[entry.intensity])}>
              <p className="text-xs font-medium truncate">{entry.topic}</p>
              <p className="text-lg font-bold mt-1">{entry.accuracy}%</p>
              <p className="text-[10px] opacity-70">{entry.attempts} attempts</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          {["critical", "high", "medium", "low"].map((level) => (
            <div key={level} className="flex items-center gap-1.5"><div className={cn("w-3 h-3 rounded", intensityColors[level].split(" ")[0])} /><span className="text-[10px] text-charcoal-500 capitalize">{level}</span></div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
