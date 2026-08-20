'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import type { Flashcard } from '@/lib/firestore/flashcard-schema';
import type { Grade } from '@/lib/flashcards/sm2';

interface ReviewSessionProps {
  cards: Flashcard[];
  onGrade: (card: Flashcard, grade: Grade) => void;
}

const GRADES: { grade: Grade; label: string; variant: 'destructive' | 'outline' | 'default' | 'gradient' }[] = [
  { grade: 2, label: 'Again', variant: 'destructive' },
  { grade: 3, label: 'Hard', variant: 'outline' },
  { grade: 4, label: 'Good', variant: 'default' },
  { grade: 5, label: 'Easy', variant: 'gradient' }
];

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Flip-and-grade review using SM-2; only cards due today (or earlier). */
export function ReviewSession({ cards, onGrade }: ReviewSessionProps) {
  const due = useMemo(() => cards.filter((c) => c.dueDate <= todayIso()), [cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (due.length === 0) {
    return <GlassCard className="py-10 text-center"><p className="text-sm text-muted-foreground">No cards due. Great work!</p></GlassCard>;
  }
  if (index >= due.length) {
    return <GlassCard className="py-10 text-center"><p className="font-semibold">Review complete!</p></GlassCard>;
  }

  const card = due[index];

  function grade(g: Grade) {
    onGrade(card, g);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">{index + 1} / {due.length} due</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id + String(flipped)}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <GlassCard className="grid min-h-[220px] cursor-pointer place-items-center p-8 text-center" >
            <button className="w-full" onClick={() => setFlipped((f) => !f)}>
              <p className="text-xs uppercase text-muted-foreground">{flipped ? 'Answer' : 'Question'}</p>
              <p className="mt-2 text-lg font-medium">{flipped ? card.back : card.front}</p>
              {!flipped && <p className="mt-4 text-xs text-muted-foreground">Tap to reveal</p>}
            </button>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
      {flipped && (
        <div className="flex justify-center gap-2">
          {GRADES.map((g) => (
            <Button key={g.grade} variant={g.variant} onClick={() => grade(g.grade)}>{g.label}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
