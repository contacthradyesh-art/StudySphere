'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Radio, Timer, BookOpen, ArrowRight, Search, User, Trophy,
  Shield, Compass, Bell, ChevronDown, Sparkles, MapPin
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
    <div className="min-h-full overflow-hidden bg-[#090610] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-violet-700/20 blur-[110px]" />
        <div className="absolute right-[-10%] top-[38%] h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[130px]" />
        <div className="absolute left-[-15%] bottom-10 h-80 w-80 rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-3 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-center">
          <h1 className="flex items-center gap-2 text-[25px] font-black tracking-tight sm:text-3xl">
            <Sparkles className="h-5 w-5 fill-violet-400 text-violet-300" />
            Together
          </h1>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-violet-300/25 bg-[radial-gradient(circle_at_72%_10%,rgba(214,89,255,.42),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(103,56,255,.28),transparent_40%),linear-gradient(145deg,#21103f,#10091d_65%,#0b0811)] p-6 shadow-[0_0_70px_rgba(125,61,255,.16)] sm:p-9">
          <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="max-w-2xl text-[32px] font-black leading-[1.02] tracking-tight sm:text-5xl">
                Study together.<br />Focus together.
              </h2>
              <p className="mt-3 text-lg font-semibold text-white/90">साथ पढ़ें, साथ फोकस करें</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Join live study rooms or host your own session and learn together in real-time
              </p>
            </div>
            <Button
              variant="gradient"
              className="h-14 rounded-2xl px-7 text-base font-bold shadow-[0_0_30px_rgba(214,76,255,.32)]"
              onClick={() => setShowCreate(true)}
              disabled={!user}
            >
              <Plus className="h-5 w-5" /> Create room
            </Button>
          </div>
        </section>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <QuickLink href="/dashboard/community/profile" icon={User} label="My profile" />
          <QuickLink href="/dashboard/community/discover" icon={Search} label="Find students" />
          <QuickLink href="/dashboard/community/notifications" icon={Bell} label="Notifications" />
          <QuickLink href="/dashboard/community/following" icon={Users} label="Connections" />
          <QuickLink href="/dashboard/community/leaderboard" icon={Trophy} label="Streaks" />
          <QuickLink href="/dashboard/community/manage" icon={Shield} label="Host tools" />
        </nav>

        <section className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-300/80" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms, topics, or students..."
              className="h-14 w-full rounded-2xl border border-violet-300/30 bg-[#100b19]/90 pl-12 pr-4 text-sm outline-none placeholder:text-white/35 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>
          <FilterSelect label="Topic" value={exam} onChange={setExam} options={['All', ...EXAMS.filter(x => x !== 'Other')]} />
          <FilterSelect label="Language" value="EN" onChange={() => undefined} options={['EN','HI','Hinglish']} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">Live Overview</h2>
              <span className="text-xs text-white/35">Realtime</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <OverviewCard icon={Users} label="Students in rooms" value={studentCount.toString()} sub="active now" />
              <OverviewCard icon={Radio} label="Live rooms" value={visible.length.toString()} sub="ongoing" />
              <OverviewCard icon={Timer} label="Shared focus" value="25m" sub="today" />
              <OverviewCard icon={MapPin} label="Student network" value="India" sub="top region" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Live Study Rooms</h2>
                <p className="text-sm text-violet-200/55">Join active study sessions · Live now</p>
              </div>
              <span className="text-sm font-semibold text-fuchsia-300">See all</span>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-violet-300/20 bg-white/[.035] p-8 text-center text-sm text-white/50">Loading rooms…</div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-400/20 bg-white/[.035] p-8 text-center"><p className="font-semibold">Could not load rooms</p><p className="mt-1 text-sm text-white/45">Please refresh and try again.</p></div>
            ) : visible.length === 0 ? (
              <div className="rounded-3xl border border-violet-300/20 bg-white/[.035] p-8 text-center"><p className="font-semibold">No matching rooms</p><p className="mt-1 text-sm text-white/45">Create a room for your exam and subject.</p></div>
            ) : (
              <div className="grid gap-3">
                {visible.slice(0, 8).map((room) => <RoomCard key={room.id} room={room} />)}
              </div>
            )}
          </div>
        </section>

        {showCreate && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-md" onMouseDown={(e) => e.currentTarget === e.target && setShowCreate(false)}>
            <div className="w-full max-w-md rounded-3xl border border-violet-300/20 bg-[#140d20] p-5 shadow-2xl">
              <h2 className="text-xl font-bold">Create a study room</h2>
              <p className="mt-1 text-xs text-white/45">Choose the exam and subject so students can find you.</p>
              <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <select value={newExam} onChange={(e) => setNewExam(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#1b1128] px-3 text-sm">{EXAMS.filter(x => x !== 'Other').map(x => <option key={x}>{x}</option>)}</select>
                <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#1b1128] px-3 text-sm">{SUBJECTS.map(x => <option key={x}>{x}</option>)}</select>
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
    <Link href={href} className="flex shrink-0 items-center gap-2 rounded-2xl border border-violet-300/20 bg-white/[.025] px-4 py-3 text-xs font-semibold text-white/85 transition hover:border-violet-300/45 hover:bg-violet-500/10">
      <Icon className="h-4 w-4 text-violet-300" /> {label}
    </Link>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-14 w-full min-w-[145px] appearance-none rounded-2xl border border-violet-300/30 bg-[#100b19]/90 px-4 pr-10 text-sm outline-none focus:border-violet-400/70">
        {options.map(x => <option key={x}>{x}</option>)}
      </select>
      <span className="pointer-events-none absolute left-4 top-1 text-[10px] font-semibold text-violet-200/45">{label}</span>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-200/70" />
    </label>
  );
}

function OverviewCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub: string }) {
  return (
    <div className="relative min-h-[150px] overflow-hidden rounded-3xl border border-violet-300/25 bg-[radial-gradient(circle_at_15%_100%,rgba(199,71,255,.18),transparent_50%),linear-gradient(145deg,rgba(31,18,48,.9),rgba(15,10,24,.92))] p-4">
      <Icon className="h-6 w-6 text-violet-300" />
      <p className="mt-2 text-sm font-semibold text-violet-200/75">{label}</p>
      <p className="mt-4 text-4xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-white/40">{sub}</p>
    </div>
  );
}

function RoomCard({ room }: { room: StudyRoom }) {
  const count = room.participantCount || 0;
  const avatars = Math.min(Math.max(count, 1), 3);
  return (
    <Link href={`/dashboard/community/${room.id}`} className="group relative block overflow-hidden rounded-[26px] border border-violet-300/30 bg-[radial-gradient(circle_at_90%_30%,rgba(194,86,255,.18),transparent_35%),linear-gradient(145deg,rgba(34,23,53,.92),rgba(16,10,26,.96))] p-5 shadow-[0_10px_35px_rgba(73,31,111,.12)] transition hover:-translate-y-0.5 hover:border-fuchsia-300/55 hover:shadow-[0_14px_45px_rgba(151,55,255,.18)]">
      <div className="absolute -right-16 top-0 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate text-2xl font-black tracking-tight sm:text-3xl">{room.name}</h3>
        <span className="shrink-0 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" />{count} online
        </span>
      </div>
      <div className="relative mt-3 flex flex-wrap gap-2">
        <span className="rounded-lg bg-violet-500/80 px-3 py-1.5 text-xs font-bold">{room.exam || 'General'}</span>
        <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/80">{room.subject || 'General Study'}</span>
      </div>
      <div className="relative mt-5 flex items-center justify-between gap-4">
        <div className="flex -space-x-2">
          {Array.from({ length: avatars }).map((_, i) => (
            <div key={i} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#211533] bg-gradient-to-br from-violet-400 to-fuchsia-500 text-xs font-black text-white shadow-lg">
              {String.fromCharCode(65 + ((room.name.length + i) % 26))}
            </div>
          ))}
          {count > 3 && <span className="ml-2 self-center text-sm font-semibold text-white/70">+{count - 3}</span>}
          {count === 0 && <span className="ml-2 self-center text-xs text-white/35">Be the first to join</span>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black shadow-[0_0_24px_rgba(206,69,255,.25)] transition group-hover:scale-[1.02]">
          Join room <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
