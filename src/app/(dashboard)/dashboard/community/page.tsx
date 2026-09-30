'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Radio, Timer, BookOpen, ArrowRight, Search, User, Trophy, Shield, Compass, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
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

  useEffect(() => subscribePublicRooms(setRooms), []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((room) => room.active)
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
        host: { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL, state: null, exam: newExam, subjects: [newSubject], isOnline: true, lastSeenAt: null }
      });
      toast.success('Study room created');
      window.location.href = `/dashboard/community/${id}`;
    } catch (error) {
      const code = error instanceof Error ? error.message : 'Unknown error';
      console.error('Study room creation failed:', error);
      toast.error('Could not create study room', {
        description: code.includes('permission-denied')
          ? 'Firebase permission denied. Please sign in again and retry.'
          : code.slice(0, 140),
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_90%_10%,rgba(139,92,246,0.22),transparent_35%),linear-gradient(145deg,#15111f,#0b0a10)] p-5 shadow-2xl sm:p-7">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200/70">StudySphere · Community</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white">Study together. Focus together.</h1><p className="mt-2 max-w-2xl text-sm text-white/55">Find students by exam and subject, join a live room, chat, and focus together.</p></div>
          <Button variant="gradient" onClick={() => setShowCreate(true)} disabled={!user}><Plus className="h-4 w-4" /> Create room</Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/community/profile" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold"><User className="h-4 w-4 text-primary"/> My profile</Link>
        <Link href="/dashboard/community/discover" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold"><Compass className="h-4 w-4 text-primary"/> Find students</Link>
        <Link href="/dashboard/community/notifications" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold"><Bell className="h-4 w-4 text-primary"/> Notifications</Link>
        <Link href="/dashboard/community/following" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold"><Users className="h-4 w-4 text-primary"/> Connections</Link>
        <Link href="/dashboard/community/leaderboard" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold"><Trophy className="h-4 w-4 text-primary"/> Streaks</Link>
        <Link href="/dashboard/community/manage" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold"><Shield className="h-4 w-4 text-primary"/> Host tools</Link>
      </div>

      <section className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms, exams, subjects..." className="h-10 w-full rounded-xl border border-input bg-background/60 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div>
        <select value={exam} onChange={(e) => setExam(e.target.value)} className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm"><option>All</option>{EXAMS.map((x) => <option key={x}>{x}</option>)}</select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm"><option>All</option>{SUBJECTS.map((x) => <option key={x}>{x}</option>)}</select>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} value={visible.reduce((n, r) => n + (r.participantCount || 0), 0).toString()} label="Students in rooms" />
        <Stat icon={Radio} value={visible.length.toString()} label="Live rooms" />
        <Stat icon={Timer} value="25m" label="Shared default focus" />
        <Stat icon={BookOpen} value="India" label="Student network" />
      </section>

      <section>
        <div className="mb-3"><h2 className="text-base font-semibold">Live study rooms</h2><p className="text-xs text-muted-foreground">{visible.length} matching rooms · realtime</p></div>
        {visible.length === 0 ? <GlassCard><p className="text-sm font-semibold">No matching rooms.</p><p className="mt-1 text-xs text-muted-foreground">Create a room for your exam and subject.</p></GlassCard> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((room) => <GlassCard key={room.id} className="group"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{room.name}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">{room.exam || 'General'}</span><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">{room.subject || 'General study'}</span></div></div><span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">{room.participantCount || 0} online</span></div><Link href={`/dashboard/community/${room.id}`} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Join room <ArrowRight className="h-3 w-3" /></Link></GlassCard>)}</div>}
      </section>

      {showCreate && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && setShowCreate(false)}>
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-background p-5 shadow-2xl">
          <h2 className="text-xl font-bold">Create a study room</h2><p className="mt-1 text-xs text-muted-foreground">Choose the exam and subject so students can find you.</p>
          <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" className="mt-4 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm" />
          <div className="mt-3 grid grid-cols-2 gap-3"><select value={newExam} onChange={(e) => setNewExam(e.target.value)} className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm">{EXAMS.filter(x => x !== 'Other').map(x => <option key={x}>{x}</option>)}</select><select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm">{SUBJECTS.map(x => <option key={x}>{x}</option>)}</select></div>
          <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button variant="gradient" onClick={createRoom} disabled={creating}>{creating ? 'Creating…' : 'Create & enter'}</Button></div>
        </div>
      </div>}
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return <GlassCard><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div><div className="mt-2 text-2xl font-black">{value}</div></GlassCard>;
}