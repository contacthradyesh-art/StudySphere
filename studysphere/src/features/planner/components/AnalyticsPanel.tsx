import { Card } from "@/components/shared/Card";
import { BarChart } from "@/components/shared/Charts";
import type { FocusAnalytics, SubjectStat } from "@/lib/planner/analytics";

interface AnalyticsPanelProps {
  focusAnalytics: FocusAnalytics;
  subjectStats: SubjectStat[];
}

export function AnalyticsPanel({ focusAnalytics, subjectStats }: AnalyticsPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card variant="glass" padding="md">
        <h3 className="text-lg font-semibold text-charcoal-50 mb-4">Analytics</h3>
        <BarChart data={focusAnalytics.weeklySeries.map((item) => ({ label: item.day, value: item.hours, color: "#007edc" }))} height={120} showLabels />
      </Card>
      <Card variant="glass" padding="md">
        <h3 className="text-lg font-semibold text-charcoal-50 mb-4">Subject progress</h3>
        <div className="space-y-3">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className="rounded-lg bg-charcoal-900/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-100">{stat.subject}</span>
                <span className="text-xs text-charcoal-400">{stat.progressPct}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-charcoal-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-electric to-neon" style={{ width: `${stat.progressPct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
