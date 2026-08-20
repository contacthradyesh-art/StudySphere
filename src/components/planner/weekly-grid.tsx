'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import type { WeeklySlot } from '@/lib/firestore/planner-schema';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Renders a Mon-Sun grid of study/revision slots. */
export function WeeklyGrid({ slots }: { slots: WeeklySlot[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {DAYS.map((day, i) => {
        const daySlots = slots.filter((s) => s.day === i);
        return (
          <GlassCard key={day} delay={i * 0.04} className="min-h-[120px]">
            <p className="mb-2 text-sm font-semibold">{day}</p>
            <div className="space-y-2">
              {daySlots.length === 0 && <p className="text-xs text-muted-foreground">Rest</p>}
              {daySlots.map((s, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'rounded-lg px-2 py-1 text-xs',
                    s.isRevision ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400' : 'bg-primary/15 text-primary'
                  )}
                >
                  <span className="font-medium">{s.subject}</span>
                  <span className="ml-1 opacity-70">{s.hours}h{s.isRevision ? ' rev' : ''}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
