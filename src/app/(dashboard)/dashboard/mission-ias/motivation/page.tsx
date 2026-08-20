'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Heart, Languages, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import { MOTIVATION_QUOTES, CATEGORY_LABELS, type MotivationCategory, type MotivationQuote } from '@/lib/mission-ias/motivation-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';

type Lang = 'en' | 'hi' | 'both';
const FAVORITES_KEY = 'mission-ias:motivation:favorites';

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function dailyQuote(): MotivationQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];
}

export default function MotivationPage() {
  const [lang, setLang] = useState<Lang>('both');
  const [category, setCategory] = useState<MotivationCategory | 'all'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [randomQuote, setRandomQuote] = useState<MotivationQuote | null>(null);

  const today = useMemo(() => dailyQuote(), []);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {
        // best-effort only
      }
      return next;
    });
  }

  function shuffleQuote() {
    const pool = MOTIVATION_QUOTES.filter((q) => q.id !== randomQuote?.id);
    setRandomQuote(pool[Math.floor(Math.random() * pool.length)]);
  }

  const filtered = useMemo(
    () => (category === 'all' ? MOTIVATION_QUOTES : MOTIVATION_QUOTES.filter((q) => q.category === category)),
    [category]
  );

  function QuoteText({ q }: { q: MotivationQuote }) {
    return (
      <div className="space-y-1.5">
        {(lang === 'en' || lang === 'both') && (
          <p className="text-base font-medium leading-relaxed">&ldquo;{q.textEn}&rdquo;</p>
        )}
        {(lang === 'hi' || lang === 'both') && (
          <p className={cn('leading-relaxed', lang === 'both' ? 'text-sm text-muted-foreground' : 'text-base font-medium')}>
            &ldquo;{q.textHi}&rdquo;
          </p>
        )}
        <p className="text-xs text-primary">&mdash; {q.author}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-6 w-6 text-primary" /> Motivation
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily strength for the UPSC journey \u2014 in English aur \u0939\u093f\u0902\u0926\u0940 dono mein.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-secondary p-1">
          {(['en', 'hi', 'both'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                lang === l ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {l === 'en' ? 'English' : l === 'hi' ? '\u0939\u093f\u0902\u0926\u0940' : <span className="flex items-center gap-1"><Languages className="h-3.5 w-3.5" /> Both</span>}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="space-y-3 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Quote of the Day</p>
        <QuoteText q={today} />
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => toggleFavorite(today.id)}
            className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium', favorites.has(today.id) ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
          >
            <Heart className={cn('h-3.5 w-3.5', favorites.has(today.id) && 'fill-current')} /> {favorites.has(today.id) ? 'Saved' : 'Save'}
          </button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Need a pep talk?</h2>
        </div>
        <p className="text-sm text-muted-foreground">Tap for an AI-generated boost, in English and Hindi, tailored to common UPSC-prep low moments.</p>
        <div className="flex flex-wrap gap-2">
          <AskAiButton
            label="I'm losing motivation"
            prompt="I'm a UPSC aspirant and I'm losing motivation today. Give me a short, genuine pep talk (not generic platitudes) in both English and Hindi, acknowledging the difficulty of this journey and giving one concrete, actionable thing I can do right now."
          />
          <AskAiButton
            label="I failed a mock test"
            prompt="I just did badly on a UPSC mock test and I'm discouraged. Give me a short, honest, encouraging message in both English and Hindi about how to process this setback productively, plus one concrete next step."
          />
          <AskAiButton
            label="I feel behind everyone else"
            prompt="I'm a UPSC aspirant and I feel like I'm behind compared to other aspirants. Give me a short, grounded, encouraging message in both English and Hindi that reframes this healthily, plus one concrete thing to focus on today instead of comparing."
          />
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory('all')}
          className={cn('rounded-full border px-3 py-1 text-xs font-medium', category === 'all' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
        >
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as MotivationCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn('rounded-full border px-3 py-1 text-xs font-medium', category === c ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
          >
            {lang === 'hi' ? CATEGORY_LABELS[c].hi : CATEGORY_LABELS[c].en}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Browse</h2>
        <button onClick={shuffleQuote} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" /> Surprise me
        </button>
      </div>

      {randomQuote && (
        <GlassCard className="space-y-2 border-primary/20">
          <QuoteText q={randomQuote} />
        </GlassCard>
      )}

      <div className="space-y-2">
        {filtered.map((q) => (
          <GlassCard key={q.id} className="space-y-2">
            <QuoteText q={q} />
            <button
              onClick={() => toggleFavorite(q.id)}
              className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium', favorites.has(q.id) ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
            >
              <Heart className={cn('h-3.5 w-3.5', favorites.has(q.id) && 'fill-current')} /> {favorites.has(q.id) ? 'Saved' : 'Save'}
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}