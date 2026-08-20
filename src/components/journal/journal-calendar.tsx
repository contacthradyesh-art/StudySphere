'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@/lib/firestore/journal-schema';

/** Month grid highlighting days that have journal entries. */
export function JournalCalendar({ entries }: { entries: JournalEntry[] }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const byDate = useMemo(() => {
    const map = new Map<string, string>(); // date -> entryId
    for (const e of entries) if (!map.has(e.date)) map.set(e.date, e.id);
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });
  const lead = (firstDay + 6) % 7; // make Monday first

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold">{monthLabel}</span>
        <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
        {Array.from({ length: lead }).map((_, i) => <div key={`lead-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entryId = byDate.get(iso);
          const cell = (
            <div className={cn(
              'grid aspect-square place-items-center rounded-lg text-sm',
              entryId ? 'bg-gradient-brand font-semibold text-white' : 'text-foreground hover:bg-accent'
            )}>
              {day}
            </div>
          );
          return entryId ? <Link key={iso} href={`/dashboard/journal/${entryId}`}>{cell}</Link> : <div key={iso}>{cell}</div>;
        })}
      </div>
    </div>
  );
}
