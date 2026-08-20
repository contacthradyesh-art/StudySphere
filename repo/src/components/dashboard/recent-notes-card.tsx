'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/shared/glass-card';
import { useNotesSync } from '@/hooks/use-notes';
import { useNotesStore } from '@/store/notes-store';

/** Live "Recent notes" card (Milestone 4). */
export function RecentNotesCard({ delay }: { delay?: number }) {
  useNotesSync();
  const notes = useNotesStore((s) => s.notes).slice(0, 5);

  return (
    <GlassCard delay={delay}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Recent notes</h2>
        <Link href="/dashboard/notes" className="text-xs text-primary hover:underline">All notes</Link>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {notes.map((n) => (
            <li key={n.id}>
              <Link href={`/dashboard/notes/${n.id}`} className="hover:underline">{n.title || 'Untitled'}</Link>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
