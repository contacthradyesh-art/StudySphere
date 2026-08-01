'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Bookmark, BookmarkCheck, NotebookPen, Landmark } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  subscribeCurrentAffairs, getBookmarkedIds, toggleBookmark
} from '@/lib/mission-ias/current-affairs-service';
import type { CurrentAffairsItem, UpscCategory } from '@/lib/mission-ias/current-affairs-schema';
import { createNote } from '@/lib/notes/notes-service';

const CATEGORY_LABELS: Record<UpscCategory, string> = {
  polity: 'Polity',
  economy: 'Economy',
  'international-relations': 'Int\u2019l Relations',
  environment: 'Environment',
  'science-tech': 'Science & Tech',
  security: 'Security',
  governance: 'Governance',
  agriculture: 'Agriculture',
  'social-issues': 'Social Issues',
  other: 'Other'
};

const CATEGORY_COLORS: Record<UpscCategory, string> = {
  polity: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  economy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'international-relations': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  environment: 'bg-green-500/15 text-green-300 border-green-500/30',
  'science-tech': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  security: 'bg-red-500/15 text-red-300 border-red-500/30',
  governance: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  agriculture: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'social-issues': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  other: 'bg-white/10 text-muted-foreground border-white/10'
};

export default function CurrentAffairsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CurrentAffairsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<UpscCategory | 'all'>('all');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCurrentAffairs((data) => { setItems(data); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    getBookmarkedIds(user.uid).then(setBookmarked);
  }, [user]);

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((i) => i.category === category)),
    [items, category]
  );

  async function handleToggleBookmark(item: CurrentAffairsItem) {
    if (!requireAuth(user)) return;
    const isBookmarked = bookmarked.has(item.id);
    const next = new Set(bookmarked);
    if (isBookmarked) next.delete(item.id); else next.add(item.id);
    setBookmarked(next);
    await toggleBookmark(user.uid, item.id, !isBookmarked);
  }

  async function handleSaveToNotes(item: CurrentAffairsItem) {
    if (!requireAuth(user)) return;
    setSavingId(item.id);
    try {
      await createNote(user.uid, {
        title: item.title,
        content: `**${CATEGORY_LABELS[item.category]} \u2014 ${item.gsPaper}**\n\n${item.summary}\n\n*Source: [${item.source}](${item.link})*`,
        subject: null,
        category: 'Current Affairs',
        tags: [item.category, 'current-affairs']
      });
      toast.success('Saved to Notes');
    } catch {
      toast.error('Could not save to notes');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Landmark className="h-6 w-6 text-primary" /> Current Affairs Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-summarized government press releases, tagged by UPSC relevance. Part of Mission IAS.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            category === 'all' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as UpscCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              category === c ? CATEGORY_COLORS[c] : 'border-white/10 text-muted-foreground hover:text-foreground'
            )}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading && <GlassCard><p className="text-sm text-muted-foreground">Loading current affairs...</p></GlassCard>}

      {!loading && filtered.length === 0 && (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            No current affairs yet. This fills up automatically once daily — check back soon, or an admin can trigger a manual fetch.
          </p>
        </GlassCard>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <GlassCard key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', CATEGORY_COLORS[item.category])}>
                {CATEGORY_LABELS[item.category]}
              </span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{item.gsPaper}</span>
              <span className="text-[11px] text-muted-foreground">{item.source}</span>
              <span className="text-[11px] text-muted-foreground">{'\u00b7'} {new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>

            <h3 className="font-semibold leading-snug">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.summary}</p>
            {item.examRelevance && (
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                📌 <span className="font-medium">UPSC Relevance:</span> {item.examRelevance}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Read original ({item.source})
              </a>
              <Button variant="ghost" size="sm" onClick={() => handleToggleBookmark(item)}>
                {bookmarked.has(item.id) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" disabled={savingId === item.id} onClick={() => handleSaveToNotes(item)}>
                <NotebookPen className="h-4 w-4" /> {savingId === item.id ? 'Saving...' : 'Save to Notes'}
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
