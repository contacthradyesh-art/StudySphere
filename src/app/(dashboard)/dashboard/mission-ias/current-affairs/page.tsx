'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Bookmark, BookmarkCheck, NotebookPen, Landmark, RefreshCw, Languages } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subscribeCurrentAffairs, getBookmarkedIds, toggleBookmark } from '@/lib/mission-ias/current-affairs-service';
import type { CurrentAffairsItem, UpscCategory } from '@/lib/mission-ias/current-affairs-schema';
import { createNote } from '@/lib/notes/notes-service';
import { AskAiButton } from '@/components/ai/ask-ai-button';

const CATEGORY_LABELS: Record<UpscCategory, string> = {
  polity: 'राजव्यवस्था', economy: 'अर्थव्यवस्था', 'international-relations': 'अंतरराष्ट्रीय संबंध', environment: 'पर्यावरण',
  'science-tech': 'विज्ञान एवं तकनीक', security: 'आंतरिक सुरक्षा', governance: 'शासन', agriculture: 'कृषि',
  'social-issues': 'सामाजिक मुद्दे', other: 'अन्य'
};
const CATEGORY_COLORS: Record<UpscCategory, string> = {
  polity: 'bg-blue-500/15 text-blue-300 border-blue-500/30', economy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'international-relations': 'bg-purple-500/15 text-purple-300 border-purple-500/30', environment: 'bg-green-500/15 text-green-300 border-green-500/30',
  'science-tech': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', security: 'bg-red-500/15 text-red-300 border-red-500/30',
  governance: 'bg-amber-500/15 text-amber-300 border-amber-500/30', agriculture: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'social-issues': 'bg-pink-500/15 text-pink-300 border-pink-500/30', other: 'bg-white/10 text-muted-foreground border-white/10'
};

export default function CurrentAffairsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CurrentAffairsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<UpscCategory | 'all'>('all');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { const unsub = subscribeCurrentAffairs((data) => { setItems(data); setLoading(false); }); return () => unsub(); }, []);
  useEffect(() => { if (!user) return; getBookmarkedIds(user.uid).then(setBookmarked).catch(() => undefined); }, [user]);
  const filtered = useMemo(() => category === 'all' ? items : items.filter((i) => i.category === category), [items, category]);

  async function handleToggleBookmark(item: CurrentAffairsItem) {
    if (!requireAuth(user)) return;
    const isBookmarked = bookmarked.has(item.id); const next = new Set(bookmarked);
    if (isBookmarked) next.delete(item.id); else next.add(item.id); setBookmarked(next);
    await toggleBookmark(user.uid, item.id, !isBookmarked);
  }
  async function handleSaveToNotes(item: CurrentAffairsItem) {
    if (!requireAuth(user)) return; setSavingId(item.id);
    try { await createNote(user.uid, { title: item.title, content: `**${CATEGORY_LABELS[item.category]} — ${item.gsPaper}**\n\n${item.summary}\n\n**UPSC महत्व:** ${item.examRelevance}\n\n*स्रोत: [${item.source}](${item.link})*`, subject: null, category: 'Current Affairs', tags: [item.category, 'current-affairs', 'hindi'] }); toast.success('नोट्स में सहेज दिया गया'); }
    catch { toast.error('नोट्स में सहेजा नहीं जा सका'); } finally { setSavingId(null); }
  }
  async function handleRefresh() {
    if (!requireAuth(user)) return; setRefreshing(true);
    try { const token = await user.getIdToken(); const res = await fetch('/api/mission-ias/refresh', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); const data = await res.json();
      if (res.status === 429) toast.message(`हाल में अपडेट हुआ है — लगभग ${data.waitSeconds} सेकंड बाद फिर कोशिश करें।`);
      else if (res.ok) toast.success('Current Affairs अपडेट शुरू हो गया है। नई सामग्री अपने-आप दिखाई देगी।'); else toast.error('अभी अपडेट नहीं हो पाया।');
    } catch { toast.error('अभी अपडेट नहीं हो पाया।'); } finally { setRefreshing(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.10] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Languages className="h-4 w-4" /> Mission IAS · हिंदी</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold"><Landmark className="h-6 w-6 text-primary" /> दैनिक समसामयिकी</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">आज की महत्वपूर्ण खबरें — सरल हिंदी में संदर्भ, UPSC महत्व, GS पेपर मैपिंग और अभ्यास के साथ।</p></div><Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}><RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />{refreshing ? 'अपडेट हो रहा है...' : 'अपडेट करें'}</Button></div>
      </GlassCard>

      <div className="flex flex-wrap gap-1.5"><button onClick={() => setCategory('all')} className={cn('rounded-full border px-3 py-1 text-xs font-medium', category === 'all' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}>सभी</button>{(Object.keys(CATEGORY_LABELS) as UpscCategory[]).map((c) => <button key={c} onClick={() => setCategory(c)} className={cn('rounded-full border px-3 py-1 text-xs font-medium', category === c ? CATEGORY_COLORS[c] : 'border-white/10 text-muted-foreground')}>{CATEGORY_LABELS[c]}</button>)}</div>

      {loading && <GlassCard><p className="text-sm text-muted-foreground">समसामयिकी लोड हो रही है...</p></GlassCard>}
      {!loading && filtered.length === 0 && <GlassCard><p className="text-sm text-muted-foreground">इस श्रेणी में अभी सामग्री नहीं है। “अपडेट करें” दबाकर नवीन सामग्री लाएँ।</p></GlassCard>}

      <div className="space-y-3">{filtered.map((item) => <GlassCard key={item.id} className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2"><span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', CATEGORY_COLORS[item.category])}>{CATEGORY_LABELS[item.category]}</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{item.gsPaper}</span>{item.topic && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">{item.topic}</span>}<span className="text-[11px] text-muted-foreground">{item.source} · {new Date(item.publishedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}</span></div>
        <h3 className="text-lg font-semibold leading-snug">{item.title}</h3><p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
        {item.examRelevance && <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">📌 <span className="font-medium">UPSC महत्व:</span> {item.examRelevance}</p>}
        <div className="flex flex-wrap items-center gap-2 pt-1"><a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" /> मूल स्रोत पढ़ें</a><Button variant="ghost" size="sm" onClick={() => handleToggleBookmark(item)}>{bookmarked.has(item.id) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}</Button><Button variant="ghost" size="sm" disabled={savingId === item.id} onClick={() => handleSaveToNotes(item)}><NotebookPen className="h-4 w-4" />{savingId === item.id ? 'सहेज रहे हैं...' : 'नोट्स में सहेजें'}</Button><AskAiButton label="AI से समझें" prompt={`इस UPSC current affairs को सरल हिंदी में समझाइए।\nशीर्षक: ${item.title}\nसारांश: ${item.summary}\nUPSC महत्व: ${item.examRelevance}\nGS: ${item.gsPaper}`} /></div>
      </GlassCard>)}</div>
    </div>
  );
}
