'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { ReviewSession } from '@/components/flashcards/review-session';
import { useAuth } from '@/hooks/use-auth';
import { createCard, reviewCard, subscribeCards } from '@/lib/flashcards/flashcard-service';
import type { Flashcard } from '@/lib/firestore/flashcard-schema';
import type { Grade } from '@/lib/flashcards/sm2';

export default function DeckReviewPage() {
  const router = useRouter();
  const { deckId } = useParams<{ deckId: string }>();
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [mode, setMode] = useState<'review' | 'manage'>('review');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCards(user.uid, deckId, setCards);
    return () => unsub();
  }, [user, deckId]);

  async function addCard() {
    if (!user || !front.trim() || !back.trim()) return;
    await createCard(user.uid, { deckId, front: front.trim(), back: back.trim(), source: 'manual' });
    setFront(''); setBack('');
    toast.success('Card added');
  }

  async function grade(card: Flashcard, g: Grade) {
    if (!user) return;
    await reviewCard(user.uid, card, g);
  }

  const dueCount = cards.filter((c) => c.dueDate <= new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.push('/dashboard/flashcards')}><ArrowLeft className="h-4 w-4" /> Decks</Button>
        <div className="flex gap-1 rounded-xl bg-secondary p-1">
          {(['review', 'manage'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize ${mode === m ? 'bg-gradient-brand text-white' : 'text-muted-foreground'}`}
            >
              {m}{m === 'review' ? ` (${dueCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {mode === 'review' ? (
        <ReviewSession cards={cards} onGrade={grade} />
      ) : (
        <div className="space-y-4">
          <GlassCard className="space-y-3">
            <h2 className="font-semibold">Add card</h2>
            <Input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (question)" />
            <Input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (answer)" />
            <Button variant="gradient" onClick={addCard}><Plus className="h-4 w-4" /> Add card</Button>
          </GlassCard>
          <div className="space-y-2">
            {cards.map((c) => (
              <GlassCard key={c.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.front}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.back}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">due {c.dueDate}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
