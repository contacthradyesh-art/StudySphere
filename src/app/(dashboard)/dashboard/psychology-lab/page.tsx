'use client';

import { useMemo, useState } from 'react';
import { Brain, Search, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  PSYCHOLOGY_THEORIES, PSYCHOLOGY_CATEGORIES, type PsychologyCategory
} from '@/lib/psychology/psychology-schema';

/** Deterministic "theory of the day" \u2014 same pick all day for everyone,
 *  cycles through the full list, no Firestore write needed. */
function todaysTheory() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return PSYCHOLOGY_THEORIES[dayOfYear % PSYCHOLOGY_THEORIES.length];
}

export default function PsychologyLabPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<PsychologyCategory | 'All'>('All');
  const insight = useMemo(() => todaysTheory(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PSYCHOLOGY_THEORIES.filter((t) => {
      const matchesCategory = category === 'All' || t.category === category;
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.coreIdea.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Brain className="h-6 w-6 text-primary" /> Psychology Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          Well-researched psychology theories for self-improvement \u2014 with practical, everyday ways to apply them.
        </p>
      </div>

      <GlassCard className="space-y-2 border-primary/30 bg-primary/5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Insight of the Day
        </p>
        <h2 className="text-lg font-bold">{insight.name} <span className="font-normal text-muted-foreground">/ {insight.hindiName}</span></h2>
        <p className="text-sm text-muted-foreground">{insight.coreIdea}</p>
        <p className="text-sm text-muted-foreground">{insight.hindiCoreIdea}</p>
        <div className="rounded-lg bg-white/5 p-2.5">
          <p className="text-xs font-semibold text-emerald-400">Try this today</p>
          <p className="text-sm">{insight.howToApply}</p>
          <p className="text-sm text-muted-foreground">{insight.hindiHowToApply}</p>
        </div>
      </GlassCard>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search theories..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['All', ...PSYCHOLOGY_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              category === c ? 'bg-gradient-brand text-white shadow' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <GlassCard key={t.id} className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{t.name} <span className="font-normal text-muted-foreground">/ {t.hindiName}</span></h3>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.originator}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">{t.category}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.coreIdea}</p>
            <p className="text-sm text-muted-foreground">{t.hindiCoreIdea}</p>
            <div className="rounded-lg bg-white/5 p-2.5">
              <p className="text-xs font-semibold text-emerald-400">How to apply it</p>
              <p className="text-sm">{t.howToApply}</p>
              <p className="text-sm text-muted-foreground">{t.hindiHowToApply}</p>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <GlassCard><p className="text-sm text-muted-foreground">No theories match your search.</p></GlassCard>
        )}
      </div>
    </div>
  );
}
