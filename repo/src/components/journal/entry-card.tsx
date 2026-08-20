'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { MOODS, type JournalEntry } from '@/lib/firestore/journal-schema';

/** Summary tile for a journal entry. */
export function EntryCard({ entry, delay }: { entry: JournalEntry; delay?: number }) {
  const mood = MOODS.find((m) => m.id === entry.mood);
  const preview = entry.locked ? 'Locked entry' : entry.content.replace(/[#*`>_-]/g, '').slice(0, 100);
  return (
    <motion.div layout>
      <Link href={`/dashboard/journal/${entry.id}`}>
        <GlassCard delay={delay} className="h-full transition-transform hover:-translate-y-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{entry.date}</span>
            <span className="text-lg">{entry.locked ? <Lock className="h-4 w-4" /> : mood?.emoji}</span>
          </div>
          <h3 className="truncate font-semibold">{entry.title || 'Untitled entry'}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{preview}</p>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
