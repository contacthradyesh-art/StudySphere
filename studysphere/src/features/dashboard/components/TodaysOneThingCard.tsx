"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import type { TodaysOneThing } from "../types";

interface TodaysOneThingCardProps { data: TodaysOneThing; onComplete: (id: string) => void; }

const priorityConfig = {
  critical: { variant: "danger" as const, label: "Critical" },
  high: { variant: "warning" as const, label: "High Priority" },
  medium: { variant: "electric" as const, label: "Medium" },
};
const typeLabels: Record<string, string> = {
  revision: "📖 Revision", practice: "✏️ Practice", mock: "📝 Mock Test", weakness: "🎯 Weakness Fix", "new-topic": "🆕 New Topic",
};

export function TodaysOneThingCard({ data, onComplete }: TodaysOneThingCardProps) {
  const [completed, setCompleted] = useState(data.completed);
  const priority = priorityConfig[data.priority];

  const handleComplete = () => { setCompleted(true); onComplete(data.id); };

  return (
    <Card variant={completed ? "default" : "glow"} className={completed ? "opacity-75" : ""}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-semibold text-charcoal-100">Today&apos;s One Thing</h3>
        </div>
        <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
      </div>
      <h4 className={`text-base font-bold mb-2 ${completed ? "line-through text-charcoal-500" : "text-charcoal-50"}`}>{data.title}</h4>
      <p className="text-sm text-charcoal-400 mb-4 leading-relaxed">{data.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="default" size="sm">{typeLabels[data.type] || data.type}</Badge>
          <span className="text-xs text-charcoal-500">~{data.estimatedMinutes} min</span>
        </div>
        {!completed && <Button size="sm" variant="neon" onClick={handleComplete}>Mark Done</Button>}
        {completed && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-neon text-sm font-medium">✓ Completed</motion.span>}
      </div>
    </Card>
  );
}
