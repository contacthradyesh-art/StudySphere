'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import type { Deck } from '@/lib/firestore/flashcard-schema';

/** Tile summarizing a flashcard deck. */
export function DeckCard({ deck, delay }: { deck: Deck; delay?: number }) {
  return (
    <Link href={`/dashboard/flashcards/${deck.id}`}>
      <GlassCard delay={delay} className="h-full transition-transform hover:-translate-y-1">
        <div className="mb-2 flex items-center justify-between">
          <Layers className="h-4 w-4 text-primary" />
          {deck.subject && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">{deck.subject}</span>}
        </div>
        <h3 className="truncate font-semibold">{deck.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{deck.cardCount} card{deck.cardCount === 1 ? '' : 's'}</p>
      </GlassCard>
    </Link>
  );
}
