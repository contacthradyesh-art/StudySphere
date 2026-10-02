'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Radio, Timer, ArrowRight, Search, User, Trophy,
  Shield, Bell, ChevronDown, Sparkles, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { createStudyRoom, subscribePublicRooms } from '@/lib/community/study-room-service';
import type { StudyRoom } from '@/lib/firestore/community-schema';

const EXAMS = ['UPSSSC PET','SSC CGL','SSC CHSL','UPSC','Banking','NEET','JEE','Other'];
const SUBJECTS = ['General Studies','Maths','Reasoning','English','Hindi','Science','History','Geography','Polity','Economy','Other'];

export default function CommunityPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [exam, setExam] = useState('All');
  const [subject, setSubject] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [newExam, setNewExam] = useState('UPSSSC PET');
  const [newSubject, setNewSubject] = useState('General Studies');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoading(true);
    return subscribePublicRooms((items) => {
      setRooms(items);
      setLoading(false);
      setLoadError(false);
    }, () => {
      setLoading(false);
      setLoadError(true);
    });
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms
      .filter((room) => room.active)
      .filter((room) => exam === 'All' || room.exam === exam)
      .filter((room) => subject === 'All' || room.subject === subject)
      .filter((room) => !q || room.name.toLowerCase().includes(q) || (room.exam || '').toLowerCase().includes(q) || (room.subject || '').toLowerCase().includes(q));
  }, [rooms, search, exam, subject]);

  async function createRoom() {
    if (!user) return;
    setCreating(true);
    try {
      const id = await createStudyRoom({
        name: roomName.trim() || `${user.displayName?.split(' ')[0] || 'Student'}'s Study Room`,
        subject: newSubject,
        exam: newExam,
        state: null,
        host: {
          uid: user.uid,
          displayName: user.displayName || 'Student',
          photoURL: user.photoURL,
          state: null,
          exam: newExam,
          subjects: [newSubject],
          isOnline: true,
          lastSeenAt: null
        }
      });
      toast.success('Study room created');
      window.location.href = `/dashboard/community/${id}`;
    } catch (error) {
      const code = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Could not create study room', {
        description: code.includes('permission-denied')
          ? 'Firebase permission denied. Please sign in again and retry.'
          : code.slice(0, 140),
      });
    } finally {
      setCreating(false);
    }
  }

  const studentCount = visible.reduce((n, r) => n + (r.participantCount || 0), 0);

  return (
    <div className="min-h-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/12" />
        <div className="absolute right-[-10%] top-[38%] h-96 w-96 rounded-full bg-fuchsia-500/8 blur-[130px] dark:bg-fuchsia-500/10" />
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <section className="ss-surface relative overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,hsl(var(--primary)/.16),transparent_32%),radial-gradient(circle_at_5%_100%,hsl(var(--primary)/.07),transparent_42%)] dark:bg-[radial-gradient(circle_at_82%_12%,hsl(var(--primary)/.22),transparent_32%),radial-gradient(circle_at_5%_100%,hsl(var(--primary)/.10),transparent_42%)]" />
          <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-500/15" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="min-w-0">
              <h2 className="text-[25px] font-black leading-[1.04] tracking-tight sm:text-3xl">
                Study together.<br />Focus together.
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
                Collaborate in real-time with peers. Stay focused and productive.
              </p>
            </div>
            <Button
              variant="gradient"
              className="h-11 shrink-0 self-start rounded-xl px-4 text-sm font-bold shadow-md shadow-primary/15 sm:self-center"
              onClick={() => setShowCreate(true)}
              disabled={!user}
            >
              <Plus className="h-4 w-4" /> Create room
            </Button>
          </div>
        </section>

        <nav className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <QuickLink href="/dashboard/community/profile" icon={User} label="My profile" />
          <QuickLink href="/dashboard/community/discover" icon={Search} label="Find students" />
          <QuickLink href="/dashboard/community/notifications" icon={Bell} label="Notifications" />
          <QuickLink href="/dashboard/community/following" icon={Users} label="Connections" />
          <QuickLink href="/dashboard/community/leaderboard" icon={Trophy} label="Streaks" />
          <QuickLink href="/dashboard/community/manage" icon={Shield} label="Host tools" />
        </nav>

        <section className="mt-3 grid gap-2.5 md:grid-cols-[1fr_180px_180px]">
          <label className="relative block">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms, topics, or students..."
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <FilterSelect label="Topic" value={exam} onChange={setExam} options={['All', ...EXAMS.filter(x => x !== 'Other')]} />
          <FilterSelect label="Language" value="EN" onChange={() => undefined} options={['EN','HI','Hinglish']} />
        </section>

        <section className="mt-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Live Overview</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                Realtime <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <OverviewCard icon={Users} label="Students in rooms" value={studentCount.toString()} sub="active now" />
              <OverviewCard icon={Radio} label="Live rooms" value={visible.length.toString()} sub="ongoing" />
              <OverviewCard icon={Timer} label="Shared focus" value="25m" sub="today" />
              <OverviewCard icon={MapPin} label="Student network" value="India" sub="top region" />
            </div>
          </div>

          <div className="mt-5 min-w-0">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Live Study Rooms</h2>
                <p className="text-xs text-muted-foreground">Join active study sessions · Live now <span className="text-emerald-500">●</span></p>
              </div>
              <Link href="/dashboard/community/discover" className="text-sm font-semibold text-primary">See all</Link>
            </div>

            {loading ? (
              <div className="ss-surface p-8 text-center text-sm text-muted-foreground">Loading rooms…</div>
            ) : loadError ? (
              <div className="ss-surface border-red-400/20 p-8 text-center"><p className="font-semibold">Could not load rooms</p><p className="mt-1 text-sm text-muted-foreground">Please refresh and try again.</p></div>
            ) : visible.length === 0 ? (
              <div className="ss-surface p-8 text-center"><p className="font-semibold">No matching rooms</p><p className="mt-1 text-sm text-muted-foreground">Create a room for your exam and subject.</p></div>
            ) : (
              <div className="grid gap-3">
                {visible.slice(0, 8).map((room) => <RoomCard key={room.id} room={room} />)}
              </div>
            )}
          </div>
        </section>

        {showCreate && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-background/80 p-4 backdrop-blur-md" onMouseDown={(e) => e.currentTarget === e.target && setShowCreate(false)}>
            <div className="ss-surface w-full max-w-md p-5 shadow-2xl">
              <h2 className="text-xl font-bold">Create a study room</h2>
              <p className="mt-1 text-xs text-muted-foreground">Choose the exam and subject so students can find you.</p>
              <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" className="mt-4 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <select value={newExam} onChange={(e) => setNewExam(e.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">{EXAMS.filter(x => x !== 'Other').map(x => <option key={x}>{x}</option>)}</select>
                <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">{SUBJECTS.map(x => <option key={x}>{x}</option>)}</select>
              </div>
              <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button variant="gradient" onClick={createRoom} disabled={creating}>{creating ? 'Creating…' : 'Create & enter'}</Button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: typeof User; label: string }) {
  return (
    <Link href={href} className="ss-press flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-2.5 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground sm:gap-2 sm:px-3 sm:py-3 sm:text-xs">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </Link>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full min-w-[145px] appearance-none rounded-xl border border-border bg-card px-3.5 pr-10 text-sm outline-none focus:border-primary/50">
        {options.map(x => <option key={x}>{x}</option>)}
      </select>
      <span className="pointer-events-none absolute left-4 top-1 text-[10px] font-semibold text-muted-foreground">{label}</span>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}

function OverviewCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub: string }) {
  return (
    <div className="ss-surface relative min-h-[112px] overflow-hidden p-3">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-2 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function RoomCard({ room }: { room: StudyRoom }) {
  const count = room.participantCount || 0;
  const avatars = Math.min(Math.max(count, 1), 3);
  return (
    <Link href={`/dashboard/community/${room.id}`} className="ss-press ss-surface group relative block overflow-hidden p-3.5 hover:-translate-y-0.5 hover:border-primary/35">
      <div className="pointer-events-none absolute -right-16 top-0 h-32 w-32 rounded-full bg-fuchsia-500/8 blur-3xl dark:bg-fuchsia-500/12" />
      <div className="relative flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-base font-black tracking-tight sm:text-lg">{room.name}</h3>
        <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" />{count} online
        </span>
      </div>
      <div className="relative mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{room.exam || 'General'}</span>
        <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{room.subject || 'General Study'}</span>
      </div>
      <div className="relative mt-3 flex items-center justify-between gap-3">
        <div className="flex -space-x-2">
          {Array.from({ length: avatars }).map((_, i) => (
            <div key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-gradient-to-br from-violet-400 to-fuchsia-500 text-xs font-black text-white shadow-lg">
              {String.fromCharCode(65 + ((room.name.length + i) % 26))}
            </div>
          ))}
          {count > 3 && <span className="ml-2 self-center text-sm font-semibold text-muted-foreground">+{count - 3}</span>}
          {count === 0 && <span className="ml-2 self-center text-xs text-muted-foreground">Be the first to join</span>}
        </div>
        <span className="ss-press inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-primary/20 transition group-hover:scale-[1.02]">
          Join room <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}