'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { subscribeCurrentAffairs, getBookmarkedIds, toggleBookmark } from '@/lib/mission-ias/current-affairs-service';
import type { CurrentAffairsItem } from '@/lib/mission-ias/current-affairs-schema';
import { createNote } from '@/lib/notes/notes-service';
import { NewsCard, CATEGORY_LABELS } from '@/components/mission-ias/news-card';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<CurrentAffairsItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCurrentAffairs((data) => { setAllItems(data); setLoading(false); }, 300);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    getBookmarkedIds(user.uid).then(setBookmarkedIds);
  }, [user]);

  const bookmarkedItems = allItems.filter((i) => bookmarkedIds.has(i.id));

  async function handleToggleBookmark(item: CurrentAffairsItem) {
    if (!requireAuth(user)) return;
    const next = new Set(bookmarkedIds);
    next.delete(item.id);
    setBookmarkedIds(next);
    await toggleBookmark(user.uid, item.id, false);
    toast.message('Removed from bookmarks');
  }

  async function handleSaveToNotes(item: CurrentAffairsItem) {
    if (!requireAuth(user)) return;
    setSavingId(item.id);
    try {
      await createNote(user.uid, {
        title: item.title,
        content: `**${CATEGORY_LABELS[item.category]} \u2014 ${item.gsPaper}**\n\n${item.summary}\n\n*Source: [${item.source}](${item.link})*`,
        subject: null,
        category: 'Bookmarked',
        tags: [item.category, 'bookmark']
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
          <Bookmark className="h-6 w-6 text-primary" /> Bookmarks
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything you\u2019ve saved from Current Affairs and Editorial Hub, in one place.
        </p>
      </div>

      {loading && <GlassCard><p className="text-sm text-muted-foreground">Loading bookmarks...</p></GlassCard>}

      {!loading && bookmarkedItems.length === 0 && (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            No bookmarks yet \u2014 tap the bookmark icon on any Current Affairs or Editorial item to save it here.
          </p>
        </GlassCard>
      )}

      <div className="space-y-3">
        {bookmarkedItems.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            bookmarked
            savingNoteId={savingId}
            onToggleBookmark={handleToggleBookmark}
            onSaveToNotes={handleSaveToNotes}
          />
        ))}
      </div>
    </div>
  );
}
