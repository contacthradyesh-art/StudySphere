'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Languages, Bookmark, Library, Map, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { subscribeVocabulary, getLearnedWordIds } from '@/lib/mission-ias/vocabulary-service';
import { getBookmarkedIds } from '@/lib/mission-ias/current-affairs-service';
import { subscribeLibraryFiles } from '@/lib/mission-ias/library-service';
import type { VocabWord } from '@/lib/mission-ias/vocabulary-schema';
import type { LibraryFile } from '@/lib/mission-ias/library-schema';

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof BarChart3; label: string; value: string | number; sub?: string }) {
  return (
    <GlassCard className="space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </GlassCard>
  );
}

export default function MissionAnalyticsPage() {
  const { user } = useAuth();
  const [vocabTotal, setVocabTotal] = useState(0);
  const [vocabLearned, setVocabLearned] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [mapBest, setMapBest] = useState<{ india: number; world: number }>({ india: 0, world: 0 });

  useEffect(() => {
    const unsub = subscribeVocabulary((words: VocabWord[]) => setVocabTotal(words.length));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    getLearnedWordIds(user.uid).then((ids) => setVocabLearned(ids.size));
    getBookmarkedIds(user.uid).then((ids) => setBookmarksCount(ids.size));
    const unsub = subscribeLibraryFiles(user.uid, (files: LibraryFile[]) => setLibraryCount(files.length));
    try {
      setMapBest({
        india: Number(localStorage.getItem('ss_map_timed_best_india') || 0),
        world: Number(localStorage.getItem('ss_map_timed_best_world') || 0)
      });
    } catch { /* ignore */ }
    return () => unsub();
  }, [user]);

  const vocabPct = vocabTotal > 0 ? Math.round((vocabLearned / vocabTotal) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <BarChart3 className="h-6 w-6 text-primary" /> Mission Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Your real progress across Mission IAS \u2014 nothing here is made up.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Languages} label="Vocabulary learned" value={`${vocabLearned}/${vocabTotal}`} sub={`${vocabPct}% of the bank`} />
        <StatCard icon={Bookmark} label="Bookmarked items" value={bookmarksCount} sub="Current Affairs + Editorials" />
        <StatCard icon={Library} label="Digital Library files" value={libraryCount} sub="Uploaded by you" />
        <StatCard icon={Map} label="Map best score (India)" value={mapBest.india} sub="Timed Challenge \u2014 60s" />
      </div>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold">Vocabulary progress</h2>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${vocabPct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{vocabLearned} of {vocabTotal} words marked learned</p>
      </GlassCard>

      <GlassCard className="flex items-center gap-3">
        <Flame className="h-8 w-8 text-orange-400" />
        <div>
          <p className="text-sm font-semibold">World map best: {mapBest.world}</p>
          <p className="text-xs text-muted-foreground">Play Map Practice \u2192 Timed Challenge to improve this.</p>
        </div>
      </GlassCard>
    </div>
  );
}
