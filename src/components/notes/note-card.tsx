'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Paperclip } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import type { Note } from '@/lib/firestore/notes-schema';

/** Summary tile for a note in the grid. */
export function NoteCard({ note, delay }: { note: Note; delay?: number }) {
  const preview = note.content.replace(/[#*`>_-]/g, '').slice(0, 120);
  return (
    <motion.div layout>
      <Link href={`/dashboard/notes/${note.id}`}>
        <GlassCard delay={delay} className="h-full transition-transform hover:-translate-y-1">
          <div className="mb-2 flex items-center justify-between">
            <FileText className="h-4 w-4 text-primary" />
            {note.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" /> {note.attachments.length}
              </span>
            )}
          </div>
          <h3 className="truncate font-semibold">{note.title || 'Untitled'}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{preview || 'Empty note'}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {note.subject && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">{note.subject}</span>}
            {note.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">#{t}</span>
            ))}
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
