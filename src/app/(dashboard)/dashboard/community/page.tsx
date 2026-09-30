'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Radio, Timer, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { createStudyRoom, subscribePublicRooms } from '@/lib/community/study-room-service';
import type { StudyRoom } from '@/lib/firestore/community-schema';

export default function CommunityPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    return subscribePublicRooms(setRooms);
  }, []);

  const visible = useMemo(() => rooms.filter((room) => room.active), [rooms]);

  async function createRoom() {
    if (!user) return;
    setCreating(true);
    try {
      const id = await createStudyRoom({
        name: `${user.displayName?.split(' ')[0] || 'Student'}'s Study Room`,
        subject: null,
        host: { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null }
      });
      toast.success('Study room created');
      window.location.href = `/dashboard/community/${id}`;
    } catch {
      toast.error('Could not create study room');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_90%_10%,rgba(139,92,246,0.22),transparent_35%),linear-gradient(145deg,#15111f,#0b0a10)] p-5 shadow-2xl sm:p-7">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200/70">StudySphere · Community</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Study together. Focus together.</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/55">Join live study rooms, start a shared Pomodoro, and see who is studying right now.</p>
          </div>
          <Button variant="gradient" onClick={createRoom} disabled={!user || creating}><Plus className="h-4 w-4" /> Create room</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} value={visible.reduce((n, r) => n + (r.participantCount || 0), 0).toString()} label="Students in rooms" />
        <Stat icon={Radio} value={visible.length.toString()} label="Live rooms" />
        <Stat icon={Timer} value="25m" label="Shared default focus" />
        <Stat icon={BookOpen} value="India" label="Built for students" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div><h2 className="text-base font-semibold">Live study rooms</h2><p className="text-xs text-muted-foreground">Realtime Firestore rooms available to students.</p></div>
        </div>
        {visible.length === 0 ? <GlassCard><p className="text-sm font-semibold">No public rooms yet.</p><p className="mt-1 text-xs text-muted-foreground">Create the first study room and invite others.</p></GlassCard> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((room) => (
              <GlassCard key={room.id} className="group">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold">{room.name}</p><p className="mt-1 text-xs text-muted-foreground">{room.subject || 'General study'}</p></div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">{room.participantCount || 0} online</span>
                </div>
                <Link href={`/dashboard/community/${room.id}`} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Join room <ArrowRight className="h-3 w-3" /></Link>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return <GlassCard><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div><div className="mt-2 text-2xl font-black">{value}</div></GlassCard>;
}