'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { subscribeCurrentAffairs, getBookmarkedIds, toggleBookmark } from '@/lib/mission-ias/current-affairs-service';
import type { CurrentAffairsItem } from '@/lib/mission-ias/current-affairs-schema';
import { createNote } from '@/lib/notes/notes-service';
import { NewsCard, CATEGORY_LABELS } from '@/components/mission-ias/news-card';

export default function EditorialHubPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CurrentAffairsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCurrentAffairs((data) => { setItems(data); setLoading(false); }, 300);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    getBookmarkedIds(user.uid).then(setBookmarked);
  }, [user]);

  const editorials = useMemo(() => items.filter((i) => i.source.toLowerCase().includes('opinion')), [items]);

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
        content: `**Editorial \u2014 ${CATEGORY_LABELS[item.category]} (${item.gsPaper})**\n\n${item.summary}\n\n*Source: [${item.source}](${item.link})*`,
        subject: null,
        category: 'Editorial',
        tags: [item.category, 'editorial']
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
          <FileText className="h-6 w-6 text-primary" /> Editorial Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Opinion & editorial pieces from The Hindu and The Indian Express, AI-summarized for UPSC Mains answer-writing angles.
        </p>
      </div>

      {loading && <GlassCard><p className="text-sm text-muted-foreground">Loading editorials...</p></GlassCard>}

      {!loading && editorials.length === 0 && (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            No editorials yet \u2014 these fill up automatically every morning alongside Current Affairs.
          </p>
        </GlassCard>
      )}

      <div className="space-y-3">
        {editorials.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            bookmarked={bookmarked.has(item.id)}
            savingNoteId={savingId}
            onToggleBookmark={handleToggleBookmark}
            onSaveToNotes={handleSaveToNotes}
          />
        ))}
      </div>
    </div>
  );
}
