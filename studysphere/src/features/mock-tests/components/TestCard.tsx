"use client";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import type { AvailableTest } from "../types";

interface TestCardProps { test: AvailableTest; onStart: (testId: string) => void; }
const modeLabels: Record<string, { label: string; color: string }> = {
  full: { label: "Full Mock", color: "electric" }, sectional: { label: "Sectional", color: "neon" },
  adaptive: { label: "Adaptive", color: "warning" }, "previous-year": { label: "Previous Year", color: "default" },
  "weak-topic": { label: "Weak Topic", color: "danger" }, "speed-drill": { label: "Speed Drill", color: "warning" },
};

export function TestCard({ test, onStart }: TestCardProps) {
  const mode = modeLabels[test.mode] || modeLabels.full;
  return (
    <Card variant="glass" hoverable>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-charcoal-50 mb-1">{test.title}</h4>
          <div className="flex items-center gap-2">
            <Badge variant={mode.color as any} size="sm">{mode.label}</Badge>
            <Badge variant="outline" size="sm">{test.examName}</Badge>
          </div>
        </div>
        {test.attempted && test.bestScore !== undefined && (
          <div className="text-right"><p className="text-lg font-bold text-electric-300">{test.bestScore}%</p><p className="text-[10px] text-charcoal-500">Best</p></div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-charcoal-400 mb-4">
        <span>📝 {test.totalQuestions} Qs</span><span>⏱️ {test.durationMinutes} min</span><span className="capitalize">📊 {test.difficulty}</span>
      </div>
      {test.topics && test.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {test.topics.map((topic) => <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full bg-charcoal-800/50 text-charcoal-400 border border-charcoal-700/30">{topic}</span>)}
        </div>
      )}
      <Button variant={test.attempted ? "secondary" : "primary"} size="sm" fullWidth onClick={() => onStart(test.id)}>
        {test.attempted ? "Retake Test" : "Start Test"}
      </Button>
    </Card>
  );
}
