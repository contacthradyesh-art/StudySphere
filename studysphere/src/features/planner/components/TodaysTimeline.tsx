import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { TimelineBlock } from "@/lib/planner/analytics";

interface TodaysTimelineProps {
  blocks: TimelineBlock[];
}

const blockStyles: Record<TimelineBlock["type"], string> = {
  anchor: "border-electric/30 bg-electric/10",
  break: "border-yellow-500/30 bg-yellow-500/10",
  focus: "border-neon/30 bg-neon/10",
  revision: "border-violet-500/30 bg-violet-500/10",
};

export function TodaysTimeline({ blocks }: TodaysTimelineProps) {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-50">Today&apos;s Timeline</h3>
          <p className="text-sm text-charcoal-400">A premium focus sequence for the current day.</p>
        </div>
        <Badge variant="outline" size="sm">Live</Badge>
      </div>
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.id} className={`rounded-xl border px-3 py-2 ${blockStyles[block.type]}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-charcoal-50">{block.label}</p>
                <p className="text-xs text-charcoal-400">{block.time} • {block.durationMinutes} min</p>
              </div>
              <span className="text-xs text-charcoal-200">{block.type}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <ProgressBar value={60} variant="electric" showLabel label="Daily momentum" />
      </div>
    </Card>
  );
}
