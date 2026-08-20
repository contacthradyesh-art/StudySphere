'use client';

import { ExternalLink, Bookmark, BookmarkCheck, NotebookPen } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AskAiButton } from '@/components/ai/ask-ai-button';
import type { CurrentAffairsItem, UpscCategory } from '@/lib/mission-ias/current-affairs-schema';

export const CATEGORY_LABELS: Record<UpscCategory, string> = {
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

export const CATEGORY_COLORS: Record<UpscCategory, string> = {
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

export function NewsCard({
  item, bookmarked, savingNoteId, onToggleBookmark, onSaveToNotes
}: {
  item: CurrentAffairsItem;
  bookmarked: boolean;
  savingNoteId: string | null;
  onToggleBookmark: (item: CurrentAffairsItem) => void;
  onSaveToNotes: (item: CurrentAffairsItem) => void;
}) {
  return (
    <GlassCard className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', CATEGORY_COLORS[item.category])}>
          {CATEGORY_LABELS[item.category]}
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{item.gsPaper}</span>
        {item.topic && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
            {item.topic}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">{item.source}</span>
        <span className="text-[11px] text-muted-foreground">{'\u00b7'} {new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>

      <h3 className="font-semibold leading-snug">{item.title}</h3>
      <p className="text-sm text-muted-foreground">{item.summary}</p>
      {item.examRelevance && (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
          {'\ud83d\udccc'} <span className="font-medium">UPSC Relevance:</span> {item.examRelevance}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5" /> Read original ({item.source})
        </a>
        <Button variant="ghost" size="sm" onClick={() => onToggleBookmark(item)}>
          {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" disabled={savingNoteId === item.id} onClick={() => onSaveToNotes(item)}>
          <NotebookPen className="h-4 w-4" /> {savingNoteId === item.id ? 'Saving...' : 'Save to Notes'}
        </Button>
        <AskAiButton
          label="Ask AI"
          prompt={`Explain this current affairs item for UPSC preparation, in simple language with the key exam-relevant points:\n\nTitle: ${item.title}\n\nSummary: ${item.summary}\n\nCategory: ${CATEGORY_LABELS[item.category]} (${item.gsPaper})`}
        />
      </div>
    </GlassCard>
  );
}
