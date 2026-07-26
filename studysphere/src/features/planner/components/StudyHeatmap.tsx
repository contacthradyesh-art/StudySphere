import { Card } from "@/components/shared/Card";
import type { HeatmapDay } from "@/lib/planner/analytics";

interface StudyHeatmapProps {
  days: HeatmapDay[];
}

const heatColors = ["#1f2937", "#2f5f94", "#2563eb", "#14b8a6", "#22c55e"];

export function StudyHeatmap({ days }: StudyHeatmapProps) {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-50">Study Heatmap</h3>
          <p className="text-sm text-charcoal-400">Focus intensity over the last 30 days.</p>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-10">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-md border border-charcoal-700/40" style={{ backgroundColor: heatColors[day.level] }} />
            <span className="text-[10px] text-charcoal-500">{day.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
