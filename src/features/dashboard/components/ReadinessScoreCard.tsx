"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "@/components/shared/Badge";
import type { ReadinessScore } from "../types";

interface ReadinessScoreCardProps { data: ReadinessScore; }

const componentLabels: Record<string, string> = {
  syllabusCoverage: "Syllabus Coverage", accuracy: "Accuracy", revision: "Revision Health",
  consistency: "Consistency", speed: "Speed",
};
const trendConfig = {
  improving: { label: "Improving", variant: "neon" as const, icon: "↑" },
  stable: { label: "Stable", variant: "default" as const, icon: "→" },
  declining: { label: "Declining", variant: "danger" as const, icon: "↓" },
};

export function ReadinessScoreCard({ data }: ReadinessScoreCardProps) {
  const trend = trendConfig[data.trend];
  return (
    <Card variant="glass" className="col-span-full lg:col-span-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <ProgressRing value={data.overall} size={120} strokeWidth={8} variant={data.overall >= 70 ? "neon" : data.overall >= 40 ? "electric" : "danger"} label="Readiness" />
          <Badge variant={trend.variant} size="sm">{trend.icon} {trend.label}</Badge>
        </div>
        <div className="flex-1 w-full space-y-3">
          <h3 className="text-sm font-semibold text-charcoal-200 mb-3">Readiness Breakdown</h3>
          {Object.entries(data.components).map(([key, value], index) => (
            <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
              <ProgressBar value={value} variant={value >= 70 ? "neon" : value >= 40 ? "electric" : "danger"} size="sm" label={componentLabels[key]} showLabel />
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
