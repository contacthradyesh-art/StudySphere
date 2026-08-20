'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/shared/glass-card';
import type { Subject } from '@/lib/firestore/planner-schema';

interface SubjectCardProps {
  subject: Subject;
  noteCount: number;
  progress: number;
  delay?: number;
}

/** Subject tile with progress bar and note count. */
export function SubjectCard({ subject, noteCount, progress, delay }: SubjectCardProps) {
  return (
    <Link href={`/dashboard/subjects/${encodeURIComponent(subject)}`}>
      <GlassCard delay={delay} className="h-full transition-transform hover:-translate-y-1">
        <h3 className="font-semibold">{subject}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{noteCount} note{noteCount === 1 ? '' : 's'}</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">{progress}%</p>
      </GlassCard>
    </Link>
  );
}
