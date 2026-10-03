'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Clock3, Flame, Lock, PenLine, Plus, Search, Sparkles, Target, CalendarDays, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useJournalSync } from '@/hooks/use-journal';
import { useJournalStore, filterEntries } from '@/store/journal-store';
import { createEntry, updateEntry } from '@/lib/journal/journal-service';
import { MOODS, type JournalEntry, type Mood } from '@/lib/firestore/journal-schema';
import { summarizeJournal } from '@/lib/journal/stats';

const BOTTOM_ACTIONS = [
  { label: 'Planner', icon: CalendarDays, href: '/dashboard/planner' },
  { label: 'Focus', icon: Target, href: '/dashboard/pomodoro' },
  { label: 'Reflect', icon: Sparkles, href: '/dashboard/ai' },
];

function dateLabel(date: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long' });
}
function prettyDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}
function prettyTime(entry: JournalEntry) {
  const source = entry.updatedAt ?? entry.createdAt;
  return source ? source.toDate().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
}
function previewFor(entry: JournalEntry) {
  if (entry.locked) return 'Locked entry';
  const raw = [entry.content, entry.reflection, ...entry.gratitude].filter(Boolean).join(' ');
  return raw.replace(/[#*>_-]/g, '').trim().slice(0, 150) || 'Aaj kuch likha nahi — ek line bhi kaafi hai.';
}
function last14Days(entries: JournalEntry[]) {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  return Array.from({ length: 14 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - index));
    const iso = d.toISOString().slice(0, 10);
    return { iso, active: Boolean(byDate.get(iso)), mood: byDate.get(iso)?.mood ?? null };
  });
}

export default function JournalPage() {
  useJournalSync();
  const router = useRouter();
  const { user } = useAuth();
  const { entries, loading, search, setSearch } = useJournalStore();
  const visible = filterEntries(entries, search);
  const stats = summarizeJournal(entries);
  const trend = useMemo(() => last14Days(entries), [entries]);

  const [todayMood, setTodayMood] = useState<Mood | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('good');
  const [gratitude, setGratitude] = useState('');
  const [reflection, setReflection] = useState('');
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = entries.find((entry) => entry.date === today);
    if (todayEntry?.mood) {
      setTodayMood(todayEntry.mood);
      setMood(todayEntry.mood);
    }
  }, [entries]);

  async function handleMoodSelect(nextMood: Mood) {
    setTodayMood(nextMood);
    setMood(nextMood);
    if (!requireAuth(user)) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const todayEntry = entries.find((entry) => entry.date === today);
      if (todayEntry) await updateEntry(user.uid, todayEntry.id, { mood: nextMood });
      else await createEntry(user.uid, { date: today, title: '', content: '', mood: nextMood, gratitude: [], reflection: '', locked: false });
      toast.success('Mood saved • ho gaya!');
    } catch {
      toast.error('Mood save nahi ho paya');
    }
  }

  function openNewEntry() {
    if (!requireAuth(user)) return;
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = entries.find((entry) => entry.date === today);
    if (todayEntry) {
      router.push('/dashboard/journal/' + todayEntry.id);
      return;
    }
    setTitle('');
    setContent('');
    setGratitude('');
    setReflection('');
    setReflectionOpen(false);
    setMood(todayMood ?? 'good');
    setNewOpen(true);
  }

  async function saveNewEntry() {
    if (!requireAuth(user)) return;
    if (!title.trim() && !content.trim() && !gratitude.trim()) {
      toast.error('Kuch toh likho — ek line bhi kaafi hai.');
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const id = await createEntry(user.uid, {
        date: today,
        title: title.trim(),
        content: content.trim(),
        mood,
        gratitude: gratitude.trim() ? [gratitude.trim()] : [],
        reflection: reflection.trim(),
        locked: false,
      });
      setNewOpen(false);
      toast.success('Entry saved • ho gaya!');
      router.push('/dashboard/journal/' + id);
    } catch {
      toast.error('Entry save nahi ho payi');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] w-full flex justify-center py-1 sm:py-4">
      <div className="relative w-full max-w-[390px] overflow-hidden rounded-[30px] sm:rounded-[36px] border border-white/[0.06] bg-[#101014] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="h-[18px] w-full flex items-center justify-center"><div className="mt-2 h-[5px] w-[64px] rounded-full bg-white/10" /></div>

        <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto px-5 pb-[118px] pt-4 sm:max-h-[820px] sm:px-6" style={{ scrollbarWidth: 'none' }}>
          <div className="mb-7 flex items-start justify-between">
            <div>
              <h1 className="text-[32px] font-[800] leading-[0.95] tracking-[-0.03em] text-white">Journal</h1>
              <p className="mt-[7px] text-[13px] tracking-[-0.01em] text-white/45">Reflect daily — thoda sa likh lo, dil halka.</p>
            </div>
            <button type="button" onClick={openNewEntry} aria-label="New entry" className="mt-1 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.97]">
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          <section className="mb-7">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[11px] font-[600] uppercase tracking-[0.12em] text-white/30">How are you feeling?</p>
              <span className="text-[11px] text-white/25">आज कैसा लगा?</span>
            </div>
            <div className="flex justify-between gap-2">
              {MOODS.map((item) => {
                const selected = todayMood === item.id;
                const hindi = item.id === 'great' ? 'बढ़िया' : item.id === 'good' ? 'अच्छा' : item.id === 'okay' ? 'ठीक' : item.id === 'low' ? 'उदास' : 'खराब';
                return (
                  <button key={item.id} type="button" onClick={() => handleMoodSelect(item.id)} className="group flex flex-col items-center gap-[9px]" aria-label={item.label}>
                    <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-[23px] transition-all duration-300 sm:h-[56px] sm:w-[56px]" style={{ backgroundColor: selected ? '#181820' : 'rgba(255,255,255,0.04)', boxShadow: selected ? '0 0 0 2px #A78BFA, 0 8px 24px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.04)', transform: selected ? 'scale(1.05)' : 'scale(1)', filter: selected ? 'none' : 'saturate(0.7) brightness(0.9)' }}>
                      <span className={selected ? '' : 'opacity-70'}>{item.emoji}</span>
                    </span>
                    <span className={selected ? 'text-[11px] font-[600] tracking-[-0.01em] text-white' : 'text-[11px] font-[600] tracking-[-0.01em] text-white/35 group-hover:text-white/50'}>{item.label}</span>
                    <span className="text-[9px] text-white/20">{hindi}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mb-7 flex items-center justify-between rounded-[24px] border border-white/[0.04] bg-[#181820] px-4 py-3.5 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(251,146,60,0.12)]"><Flame className="h-[18px] w-[18px] text-orange-400" /></div>
              <div>
                <p className="text-[13px] font-[600] leading-none tracking-[-0.01em] text-white">{stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'} streak • Keep it up!</p>
                <div className="mt-[7px] flex gap-[5px]">
                  {trend.map((day) => <div key={day.iso} title={day.iso} className="h-[6px] flex-1 rounded-full" style={{ minWidth: 7, maxWidth: 14, backgroundColor: day.active ? (day.mood === 'great' ? '#A78BFA' : 'rgba(255,255,255,0.55)') : 'rgba(255,255,255,0.12)', opacity: day.active ? 0.5 : 1 }} />)}
                </div>
              </div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06]"><ArrowRight className="h-3.5 w-3.5 text-white/40" /></div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-[700] tracking-[-0.02em] text-white">Recent Entries</h2>
              <span className="text-[11px] font-[500] text-white/25">{visible.length} {visible.length === 1 ? 'entry' : 'entries'}</span>
            </div>

            <div className="mb-5 flex h-[44px] items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.06] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[20px]">
              <Search className="h-4 w-4 shrink-0 text-white/30" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search memories... yaad karo" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/30" />
            </div>

            {loading && <div className="rounded-[24px] border border-white/[0.04] bg-[#181820] p-5 text-[12px] text-white/35">Loading memories...</div>}

            {!loading && visible.length === 0 && (
              <div className="flex flex-col items-center rounded-[24px] border border-white/[0.04] bg-[#181820] px-5 py-14 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]"><PenLine className="h-6 w-6 text-white/20" /></div>
                <p className="text-[14px] font-[600] text-white">{search ? 'No matching entries' : 'No entries yet'}</p>
                <p className="mt-1 max-w-[220px] text-[12px] leading-[1.4] text-white/35">{search ? 'Search ko thoda change karke dekho.' : 'Start with a small note — ek line bhi kaafi hai. Your mind deserves space.'}</p>
                {!search && <button type="button" onClick={openNewEntry} className="mt-5 h-9 rounded-full bg-white px-5 text-[13px] font-[600] text-black transition hover:bg-white/90">Write first entry</button>}
              </div>
            )}

            {!loading && visible.length > 0 && (
              <div className="relative">
                <div className="absolute bottom-2 left-[5px] top-2 w-px bg-gradient-to-b from-white/10 via-white/[0.06] to-transparent" />
                <div className="flex flex-col gap-4">
                  {visible.map((entry) => {
                    const entryMood = MOODS.find((item) => item.id === entry.mood);
                    return (
                      <Link href={'/dashboard/journal/' + entry.id} key={entry.id} className="group relative block pl-[26px]">
                        <span className="absolute left-0 top-[18px] h-[11px] w-[11px] rounded-full border-[2.5px] border-white/20 bg-[#101014] shadow-[0_0_0_3px_#101014] transition-colors group-hover:border-[#A78BFA]" />
                        <div className="rounded-[24px] border border-white/[0.05] bg-[#181820] p-4 pr-3.5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] transition-all group-hover:bg-[#1d1d26]">
                          <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-[700] tracking-[0.12em] text-white/25">{prettyDate(entry.date)}</span><span className="text-[10px] font-[500] text-white/20">{dateLabel(entry.date)}</span></div>
                          <h3 className="mt-2 text-[15px] font-[650] leading-[1.25] tracking-[-0.015em] text-white">{entry.title || 'Untitled entry'}</h3>
                          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.5] tracking-[-0.01em] text-white/45">{previewFor(entry)}</p>
                          <div className="mt-3 flex items-center gap-2.5">
                            <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/[0.06] text-[12px]">{entry.locked ? <Lock className="h-3 w-3 text-white/30" /> : entryMood?.emoji ?? '•'}</div>
                            <span className="flex items-center gap-1 text-[11px] text-white/30"><Clock3 className="h-[11px] w-[11px]" />{prettyTime(entry)}</span>
                            {entry.locked && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06]"><Lock className="h-2.5 w-2.5 text-white/30" /></span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
          <div className="h-4" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#101014] via-[#101014]/90 to-transparent px-5 pb-4 pt-4">
          <div className="flex h-16 items-center justify-around rounded-full border border-white/[0.08] bg-[rgba(24,24,32,0.92)] px-2 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[28px]">
            <button type="button" onClick={openNewEntry} className="flex h-11 w-16 flex-col items-center justify-center gap-[2px] rounded-full bg-white text-black transition-transform active:scale-[0.98]"><PenLine className="h-[18px] w-[18px]" strokeWidth={2.2} /><span className="text-[10px] font-[600]">New</span></button>
            {BOTTOM_ACTIONS.map((action) => {
              const Icon = action.icon;
              return <Link key={action.label} href={action.href} className="flex h-11 w-16 flex-col items-center justify-center gap-[2px] rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"><Icon className="h-[18px] w-[18px]" strokeWidth={1.6} /><span className="text-[10px] font-[600]">{action.label}</span></Link>;
            })}
          </div>
          <div className="mt-3 flex justify-center"><div className="h-1 w-9 rounded-full bg-white/20" /></div>
        </div>

        {newOpen && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <button type="button" aria-label="Close new entry" onClick={() => setNewOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-[12px]" />
            <div className="relative max-h-[90%] w-full overflow-y-auto rounded-t-[32px] border-t border-white/[0.08] bg-[#181820] shadow-[0_-10px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex justify-center pb-2 pt-3"><div className="h-1 w-9 rounded-full bg-white/15" /></div>
              <div className="px-6 pb-7">
                <div className="mb-5 flex items-center justify-between">
                  <div><h3 className="text-[17px] font-[700] tracking-[-0.02em] text-white">New Entry</h3><span className="text-[11px] text-white/30">Naya panna • Today</span></div>
                  <button type="button" onClick={() => setNewOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/45" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title — aaj kya hua?" className="mb-4 w-full bg-transparent text-[20px] font-[700] leading-[1.2] tracking-[-0.02em] text-white outline-none placeholder:text-white/20" />
                <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What's on your mind? — dil me kya hai?" rows={5} className="min-h-[140px] w-full resize-none rounded-[20px] border border-white/[0.06] bg-[#101014] p-4 text-[13px] leading-[1.6] text-white outline-none placeholder:text-white/25 focus:border-white/15" />
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-[600] uppercase tracking-[0.12em] text-white/30">Mood</span><span className="text-[11px] text-white/20">आज कैसा लगा?</span></div>
                  <div className="flex gap-2 overflow-x-auto pb-1">{MOODS.map((item) => <button key={item.id} type="button" onClick={() => setMood(item.id)} className={mood === item.id ? 'flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#A78BFA]/60 bg-[#A78BFA]/10 px-3 text-[11px] text-white' : 'flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 text-[11px] text-white/40'}><span>{item.emoji}</span>{item.label}</button>)}</div>
                </div>
                <div className="mt-5 rounded-[16px] border border-white/[0.06] bg-[#101014] p-3">
                  <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]"><Sparkles className="h-4 w-4 text-white/40" /></div><div><p className="text-[13px] font-[600] text-white">Gratitude</p><p className="mt-1 text-[11px] text-white/30">Aaj kis cheez ke liye thankful ho?</p></div></div>
                  <input value={gratitude} onChange={(event) => setGratitude(event.target.value)} placeholder="Chai, family, ek small win..." className="mt-3 w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/20" />
                </div>
                <button type="button" onClick={() => setReflectionOpen((value) => !value)} className="mt-3 flex w-full items-center justify-between rounded-[16px] border border-white/[0.06] bg-[#101014] p-3 text-left">
                  <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]"><ChevronDown className={reflectionOpen ? 'h-4 w-4 rotate-180 text-white/40 transition-transform' : 'h-4 w-4 text-white/40 transition-transform'} /></div><div><p className="text-[13px] font-[600] text-white">Reflection</p><p className="mt-1 text-[11px] text-white/30">Socho • What did you learn?</p></div></div>
                </button>
                {reflectionOpen && <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Aaj se kya seekha? Kal kya better kar sakte ho?" rows={3} className="mt-2 w-full resize-none rounded-[16px] border border-white/[0.06] bg-[#101014] p-3 text-[13px] leading-[1.5] text-white outline-none placeholder:text-white/25" />}
                <button type="button" onClick={saveNewEntry} disabled={saving} className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-[14px] font-[650] tracking-[-0.01em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.35)] transition-transform active:scale-[0.98] disabled:opacity-50"><PenLine className="h-4 w-4" />{saving ? 'Saving...' : 'Save Entry'}<span className="ml-1 text-[11px] font-[500] text-white/70">• ho gaya!</span></button>
                <p className="mt-3 text-center text-[11px] text-white/20">Private • Encrypted on device • sirf tumhara</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
