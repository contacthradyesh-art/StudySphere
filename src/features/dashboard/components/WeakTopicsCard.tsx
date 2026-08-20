"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "@/components/shared/Badge";
import { formatDate } from "@/utils/formatters";
import type { WeakTopic } from "../types";

interface WeakTopicsCardProps { topics: WeakTopic[]; }
const trendIcons: Record<string, { icon: string; color: string }> = {
  improving: { icon: "↑", color: "text-neon" }, stable: { icon: "→", color: "text-charcoal-400" }, declining: { icon: "↓", color: "text-red-400" },
};

export function WeakTopicsCard({ topics }: WeakTopicsCardProps) {
  return (
    <Card variant="glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><span className="text-lg">⚠️</span><h3 className="text-sm font-semibold text-charcoal-100">Weak Topics</h3></div>
        <Badge variant="danger" size="sm">{topics.length} topics</Badge>
      </div>
      <div className="space-y-4">
        {topics.map((topic, index) => {
          const trend = trendIcons[topic.trend];
          return (
            <motion.div key={topic.topicId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="group">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <p className="text-sm font-medium text-charcoal-100 group-hover:text-electric-300 transition-colors">{topic.topicName}</p>
                  <p className="text-xs text-charcoal-500">{topic.subject}</p>
                </div>
                <span className={`text-xs font-medium ${trend.color}`}>{trend.icon} {topic.accuracy}%</span>
              </div>
              <ProgressBar value={topic.accuracy} variant={topic.accuracy < 40 ? "danger" : topic.accuracy < 60 ? "warning" : "electric"} size="sm" />
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-charcoal-500">{topic.totalAttempts} attempts</span>
                <span className="text-[10px] text-charcoal-600">•</span>
                <span className="text-[10px] text-charcoal-500">Last: {formatDate(topic.lastAttempted, "relative")}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
