import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import type { WeeklySlot } from "@/lib/firestore/planner-schema";

interface WeeklyBoardProps {
  weeklySlots: WeeklySlot[];
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyBoard({ weeklySlots }: WeeklyBoardProps) {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-50">Weekly Board</h3>
          <p className="text-sm text-charcoal-400">Subject blocks arranged by day for the current week.</p>
        </div>
        <Badge variant="electric" size="sm">7-day view</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dayLabels.map((label, index) => {
          const slots = weeklySlots.filter((slot) => slot.day === index);
          return (
            <div key={label} className="rounded-xl border border-charcoal-700/40 bg-charcoal-900/50 p-3">
              <p className="text-sm font-semibold text-charcoal-100">{label}</p>
              <div className="mt-2 space-y-2">
                {slots.length > 0 ? slots.map((slot) => (
                  <div key={`${label}-${slot.subject}-${slot.hours}`} className="rounded-lg bg-charcoal-800/70 p-2">
                    <p className="text-xs font-medium text-charcoal-50">{slot.subject}</p>
                    <p className="text-[11px] text-charcoal-400">{slot.hours}h {slot.isRevision ? "revision" : "focus"}</p>
                  </div>
                )) : <p className="text-xs text-charcoal-500">Buffer day</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
