'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Languages, Search, CheckCircle2, Circle, Shuffle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subscribeVocabulary, getLearnedWordIds, markWordLearned } from '@/lib/mission-ias/vocabulary-service';
import type { VocabWord, WordDifficulty } from '@/lib/mission-ias/vocabulary-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';
import { subscribeDecks, createDeck, createCard } from '@/lib/flashcards/flashcard-service';
import type { Deck } from '@/lib/firestore/flashcard-schema';

const DIFFICULTY_COLORS: Record<WordDifficulty, string> = {
  easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  hard: 'bg-red-500/15 text-red-300 border-red-500/30'
};

const DECK_NAME = 'Mission IAS Vocabulary';

type Mode = 'browse' | 'quiz';

export default function VocabularyLabPage() {
  const { user } = useAuth();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<WordDifficulty | 'all'>('all');
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('browse');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerateMore() {
    if (!requireAuth(user)) return;
    setGenerating(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/mission-ias/generate-vocabulary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed');
      toast.success(data.added > 0 ? `Added ${data.added} new words!` : 'No new words this time — try again in a bit.');
    } catch {
      toast.error('Could not generate words. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    const unsub = subscribeVocabulary((data) => { setWords(data); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    getLearnedWordIds(user.uid).then(setLearned);
    const unsub = subscribeDecks(user.uid, setDecks);
    return () => unsub();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      const matchesDiff = difficulty === 'all' || w.difficulty === difficulty;
      const matchesSearch = !q || w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q);
      return matchesDiff && matchesSearch;
    });
  }, [words, search, difficulty]);

  async function handleToggleLearned(word: VocabWord) {
    if (!requireAuth(user)) return;
    const isLearned = learned.has(word.id);
    const next = new Set(learned);
    if (isLearned) next.delete(word.id); else next.add(word.id);
    setLearned(next);
    await markWordLearned(user.uid, word.id, !isLearned);
  }

  async function handleAddToFlashcards(word: VocabWord) {
    if (!requireAuth(user)) return;
    setSavingId(word.id);
    try {
      let deck = decks.find((d) => d.name === DECK_NAME);
      let deckId = deck?.id;
      if (!deckId) {
        deckId = await createDeck(user.uid, { name: DECK_NAME, subject: null });
      }
      await createCard(user.uid, {
        deckId,
        front: word.word,
        back: `${word.meaning}\n\nHindi: ${word.hindiMeaning}\n\nExample: ${word.exampleSentence}`,
        source: 'ai'
      });
      toast.success(`Added "${word.word}" to Flashcards`);
    } catch {
      toast.error('Could not add to flashcards');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Languages className="h-6 w-6 text-primary" /> Vocabulary Lab
          </h1>
          <p className="text-sm text-muted-foreground">
            Advanced words for UPSC-level reading, with Hindi meanings and editorial usage. {words.length} words in the bank.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateMore} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate More Words'}
          </Button>
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
          <button
            onClick={() => setMode('browse')}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', mode === 'browse' ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground')}
          >
            Browse
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', mode === 'quiz' ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground')}
          >
            Quiz Me
          </button>
          </div>
        </div>
      </div>

      {mode === 'browse' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search words..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                  difficulty === d ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground'
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {loading && <GlassCard><p className="text-sm text-muted-foreground">Loading vocabulary...</p></GlassCard>}
          {!loading && filtered.length === 0 && (
            <GlassCard><p className="text-sm text-muted-foreground">No words yet — check back soon, or an admin can trigger a manual generation.</p></GlassCard>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((word) => {
              const isFlipped = flippedId === word.id;
              const isLearned = learned.has(word.id);
              return (
                <GlassCard key={word.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize', DIFFICULTY_COLORS[word.difficulty])}>
                      {word.difficulty}
                    </span>
                    <button onClick={() => handleToggleLearned(word)} className="text-muted-foreground hover:text-primary">
                      {isLearned ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4" />}
                    </button>
                  </div>

                  <button onClick={() => setFlippedId(isFlipped ? null : word.id)} className="w-full text-left">
                    <h3 className="text-lg font-bold">{word.word}</h3>
                    <p className="text-[11px] italic text-muted-foreground">{word.partOfSpeech}</p>

                    {!isFlipped ? (
                      <p className="pt-2 text-xs text-muted-foreground">Tap to reveal meaning \u2192</p>
                    ) : (
                      <div className="space-y-1.5 pt-2 text-sm">
                        <p>{word.meaning}</p>
                        <p className="text-primary">{word.hindiMeaning}</p>
                        {word.synonyms.length > 0 && <p className="text-xs text-muted-foreground"><strong>Synonyms:</strong> {word.synonyms.join(', ')}</p>}
                        {word.antonyms.length > 0 && <p className="text-xs text-muted-foreground"><strong>Antonyms:</strong> {word.antonyms.join(', ')}</p>}
                        <p className="text-xs italic text-muted-foreground">"{word.exampleSentence}"</p>
                      </div>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleAddToFlashcards(word)}
                      disabled={savingId === word.id}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      {savingId === word.id ? 'Saving...' : '+ Flashcards'}
                    </button>
                    <AskAiButton
                      label="Ask AI"
                      prompt={`Explain the word "${word.word}" (${word.meaning}) with 2 more example sentences, and tell me how it might be used in a UPSC essay or answer.`}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </>
      ) : (
        <QuizMode words={words} />
      )}
    </div>
  );
}

function QuizMode({ words }: { words: VocabWord[] }) {
  const [pool, setPool] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  function startQuiz() {
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    setPool(shuffled); setIndex(0); setScore(0); setSelected(null); setFinished(false);
  }

  useEffect(() => { if (words.length >= 4) startQuiz(); }, [words.length]);

  const current = pool[index];
  const options = useMemo(() => {
    if (!current) return [];
    const distractors = words.filter((w) => w.id !== current.id).sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.meaning);
    return [...distractors, current.meaning].sort(() => Math.random() - 0.5);
  }, [current, words]);

  if (words.length < 4) {
    return <GlassCard><p className="text-sm text-muted-foreground">Need at least 4 words in the bank to start a quiz.</p></GlassCard>;
  }
  if (pool.length === 0 || !current) return null;

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === current.meaning) setScore((s) => s + 1);
    setTimeout(() => {
      if (index + 1 < pool.length) { setIndex((i) => i + 1); setSelected(null); }
      else setFinished(true);
    }, 900);
  }

  if (finished) {
    return (
      <GlassCard className="space-y-3 text-center">
        <h3 className="text-lg font-bold">Quiz complete! {score}/{pool.length}</h3>
        <Button variant="gradient" onClick={startQuiz}><Shuffle className="h-4 w-4" /> New quiz</Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {index + 1} of {pool.length}</span>
        <span>Score: {score}</span>
      </div>
      <h3 className="text-xl font-bold">{current.word}</h3>
      <p className="text-xs italic text-muted-foreground">What does this word mean?</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isCorrect = opt === current.meaning;
          const isSelected = opt === selected;
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={!!selected}
              className={cn(
                'w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors',
                selected
                  ? (isCorrect ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                    : isSelected ? 'border-red-500 bg-red-500/15 text-red-200'
                    : 'border-white/10 text-muted-foreground')
                  : 'border-white/10 hover:border-primary/40 hover:bg-primary/5'
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
