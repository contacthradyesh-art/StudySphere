'use client';

import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { DeckCard } from '@/components/flashcards/deck-card';
import { useAuth } from '@/hooks/use-auth';
import { useDecksSync } from '@/hooks/use-decks';
import { useFlashcardStore } from '@/store/flashcard-store';
import { createCards, createDeck } from '@/lib/flashcards/flashcard-service';
import { askAi } from '@/lib/ai/ai-client';
import { SUBJECTS, type Subject } from '@/lib/firestore/planner-schema';

export default function FlashcardsPage() {
  useDecksSync();
  const { user } = useAuth();
  const { decks, loading } = useFlashcardStore();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [aiText, setAiText] = useState('');
  const [generating, setGenerating] = useState(false);

  async function addDeck() {
    if (!user || !name.trim()) return;
    await createDeck(user.uid, { name: name.trim(), subject: (subject || null) as Subject | null });
    setName(''); setSubject('');
    toast.success('Deck created');
  }

  async function generateDeck() {
    if (!user || !aiText.trim()) return;
    setGenerating(true);
    try {
      const res = await askAi({ task: 'flashcards', text: aiText });
      const cards = res.flashcards ?? [];
      if (cards.length === 0) { toast.error('No cards could be generated'); return; }
      const deckId = await createDeck(user.uid, { name: `AI deck (${new Date().toLocaleDateString()})`, subject: null });
      await createCards(user.uid, deckId, cards);
      toast.success(`Generated ${cards.length} cards${res.fallback ? ' (offline mode)' : ''}`);
      setAiText('');
    } catch {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
        <p className="text-sm text-muted-foreground">Active recall with SM-2 spaced repetition.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <h2 className="font-semibold">New deck</h2>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Deck name" />
          <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm">
            <option value="">No subject</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="gradient" onClick={addDeck}><Plus className="h-4 w-4" /> Create deck</Button>
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" /> AI generate</h2>
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="Paste notes or 'Term: definition' lines..."
            className="min-h-[96px] w-full rounded-lg border border-input bg-background/60 p-3 text-sm"
          />
          <Button variant="gradient" onClick={generateDeck} disabled={generating}>
            {generating ? 'Generating...' : 'Generate flashcards'}
          </Button>
        </GlassCard>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading decks...</p>}
      {!loading && decks.length === 0 && <p className="text-sm text-muted-foreground">No decks yet. Create or generate one!</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {decks.map((d, i) => <DeckCard key={d.id} deck={d} delay={i * 0.03} />)}
      </div>
    </div>
  );
}
