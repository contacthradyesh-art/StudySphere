'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Lock, LockOpen, Save, Trash2, Sparkles, Calendar, Heart, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { LockDialog } from '@/components/journal/lock-dialog';
import { DiaryEditor } from '@/components/journal/diary-editor';
import { useAuth } from '@/hooks/use-auth';
import { deleteEntry, getEntry, updateEntry } from '@/lib/journal/journal-service';
import { decryptText, encryptText } from '@/lib/journal/journal-crypto';
import { cn } from '@/lib/utils';
import { useJournalStore } from '@/store/journal-store';
import { summarizeJournal } from '@/lib/journal/stats';
import type { JournalEntry, Mood } from '@/lib/firestore/journal-schema';

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
  { value: 'bad', emoji: '😣', label: 'Awful' },
];

const QUOTES = [
  'Small steps every day lead to big changes.',
  'Your story matters, even the quiet chapters.',
  'Reflection today, growth tomorrow.',
];

export default function JournalEntryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [reflection, setReflection] = useState('');
  const [locked, setLocked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [dialog, setDialog] = useState<null | 'lock' | 'unlock'>(null);
  const [saving, setSaving] = useState(false);
  const [sessionPass, setSessionPass] = useState<string | null>(null);

  // Existing streak data, reused read-only from the journal store/stats helpers
  // that already power the dashboard's JournalStats card — purely additive,
  // doesn't touch save/load logic. If your `summarizeJournal` return shape
  // uses a different field name, adjust the line below to match it.
  const { entries: allEntries } = useJournalStore();
  const stats = summarizeJournal(allEntries);
  const streak = (stats as any)?.streak ?? (stats as any)?.currentStreak ?? 0;

  const load = useCallback(async () => {
    if (!user) return;
    const e = await getEntry(user.uid, id);
    if (!e) { toast.error('Entry not found'); router.push('/dashboard/journal'); return; }
    setEntry(e);
    setTitle(e.title); setMood(e.mood); setGratitude(e.gratitude.join('\n')); setReflection(e.reflection);
    setLocked(e.locked);
    if (!e.locked) { setContent(e.content); setUnlocked(true); }
    else { setUnlocked(false); setContent(''); }
  }, [user, id, router]);

  useEffect(() => { load(); }, [load]);

  async function persist(extra: Partial<JournalEntry>) {
    if (!user) return;
    await updateEntry(user.uid, id, {
      title: title.trim(),
      mood,
      gratitude: gratitude.split('\n').map((g) => g.trim()).filter(Boolean),
      reflection,
      ...extra
    });
  }

  async function save() {
    if (!user || (locked && !unlocked)) return;
    setSaving(true);
    try {
      if (locked && sessionPass) {
        const { ciphertext, salt, iv } = await encryptText(content, sessionPass);
        await persist({ content: ciphertext, locked: true, salt, iv });
      } else {
        await persist({ content, locked: false });
      }
      toast.success('Entry saved');
      await load();
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function handleLock(passphrase: string) {
    if (!user) return;
    const { ciphertext, salt, iv } = await encryptText(content, passphrase);
    await persist({ content: ciphertext, locked: true, salt, iv });
    setSessionPass(passphrase);
    setLocked(true);
    setUnlocked(true);
    setDialog(null);
    toast.success('Entry locked & encrypted');
    await load();
  }

  async function handleUnlock(passphrase: string) {
    if (!entry?.salt || !entry?.iv) return;
    try {
      const plain = await decryptText({ ciphertext: entry.content, salt: entry.salt, iv: entry.iv }, passphrase);
      setContent(plain);
      setUnlocked(true);
      setSessionPass(passphrase);
      setDialog(null);
      toast.success('Unlocked');
    } catch {
      toast.error('Wrong passphrase');
    }
  }

  async function remove() {
    if (!user) return;
    await deleteEntry(user.uid, id);
    toast.success('Entry deleted');
    router.push('/dashboard/journal');
  }

  if (!entry) return <p className="text-sm text-muted-foreground">Loading entry...</p>;

  const quote = QUOTES[new Date(entry.date).getDate() % QUOTES.length];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.push('/dashboard/journal')}>
          <ArrowLeft className="h-4 w-4" /> Back to entries
        </Button>
        <div className="flex gap-2">
          {locked && !unlocked ? (
            <Button variant="outline" onClick={() => setDialog('unlock')}><LockOpen className="h-4 w-4" /> Unlock</Button>
          ) : (
            <Button variant="outline" onClick={() => setDialog('lock')}><Lock className="h-4 w-4" /> {locked ? 'Re-lock' : 'Lock'}</Button>
          )}
          <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Delete</Button>
          <Button variant="gradient" onClick={save} disabled={saving || (locked && !unlocked)}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="bg-gradient-brand bg-clip-text text-3xl font-bold text-transparent">New Journal Entry</h1>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          Capture your day, reflect &amp; grow <Heart className="h-3.5 w-3.5 text-pink-400" />
        </p>
      </div>

      <div className="flex justify-center">
        <span className="flex items-center gap-2 rounded-full border border-input bg-secondary/40 px-4 py-1.5 text-sm font-medium">
          <Calendar className="h-4 w-4 text-primary" />
          {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-medium">
          Entry title <Sparkles className="h-3.5 w-3.5 text-primary" />
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your entry a title..."
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-medium">
          How was your day? <Sparkles className="h-3.5 w-3.5 text-primary" />
        </label>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition-colors',
                mood === m.value ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/40'
              )}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {locked && !unlocked ? (
        <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">This entry is encrypted. Unlock it to read or edit.</p>
          <Button variant="gradient" onClick={() => setDialog('unlock')}>Unlock</Button>
        </GlassCard>
      ) : (
        <>
          <DiaryEditor value={content} onChange={setContent} streak={streak} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GlassCard>
              <h2 className="mb-1 flex items-center gap-1.5 font-semibold text-pink-400">
                <Heart className="h-4 w-4" /> Gratitude
              </h2>
              <p className="mb-2 text-xs text-muted-foreground">List things you&apos;re grateful for</p>
              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="One per line..."
                className="min-h-[120px] w-full rounded-lg border border-input bg-background/60 p-3 text-sm"
              />
            </GlassCard>
            <GlassCard>
              <h2 className="mb-1 flex items-center gap-1.5 font-semibold text-amber-400">
                <Lightbulb className="h-4 w-4" /> Reflection
              </h2>
              <p className="mb-2 text-xs text-muted-foreground">What did you learn today?</p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your learnings..."
                className="min-h-[120px] w-full rounded-lg border border-input bg-background/60 p-3 text-sm"
              />
            </GlassCard>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-full bg-secondary/40 px-4 py-2.5 text-center text-sm text-muted-foreground">
            ✨ {quote} <Heart className="h-3.5 w-3.5 text-pink-400" />
          </div>
        </>
      )}

      <LockDialog
        open={dialog !== null}
        mode={dialog ?? 'lock'}
        onClose={() => setDialog(null)}
        onSubmit={dialog === 'lock' ? handleLock : handleUnlock}
      />
    </div>
  );
}