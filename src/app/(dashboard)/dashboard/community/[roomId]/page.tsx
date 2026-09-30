'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock3, Play, Users, Radio, Square, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { joinStudyRoom, leaveStudyRoom, subscribeRoomMembers, subscribeSharedFocus, updateRoomPresence, startSharedFocus, stopSharedFocus } from '@/lib/community/study-room-service';
import type { RoomMember, SharedFocusSession } from '@/lib/firestore/community-schema';

export default function StudyRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [focus, setFocus] = useState<SharedFocusSession[]>([]);
  const [joined, setJoined] = useState(false);
  const active = focus[0] && new Date((focus[0].endsAt as any)?.toDate?.() ?? focus[0].endsAt).getTime() > Date.now();

  useEffect(() => {
    if (!roomId) return;
    const a = subscribeRoomMembers(roomId, setMembers);
    const b = subscribeSharedFocus(roomId, setFocus);
    return () => { a(); b(); };
  }, [roomId]);

  useEffect(() => {
    if (!user || !roomId) return;
    joinStudyRoom(roomId, { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null }).then(() => setJoined(true));
    return () => { void leaveStudyRoom(roomId, user.uid); };
  }, [user, roomId]);

  useEffect(() => {
    if (!user || !roomId) return;
    return () => { void updateRoomPresence(roomId, { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null }, 'away'); };
  }, [user, roomId]);

  async function beginFocus() {
    if (!user || !roomId) return;
    try {
      await startSharedFocus(roomId, user.uid, 25, null);
      await updateRoomPresence(roomId, { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null }, 'studying');
      toast.success('Shared Pomodoro started');
    } catch {
      toast.error('Could not start shared focus');
    }
  }

  async function breakNow() {
    if (!user || !roomId) return;
    try {
      await stopSharedFocus(roomId, user.uid);
      await updateRoomPresence(roomId, { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null }, 'online');
    } catch {
      toast.error('Could not switch to break');
    }
  }

  const studying = members.filter((m) => m.status === 'studying');
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs text-primary">Community / Study Room</p><h1 className="text-2xl font-bold">Live Study Room</h1></div>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard/community'}><LogOut className="h-4 w-4" /> Leave</Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18),transparent_50%)]" />
          <div className="relative text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-violet-300">Room Pomodoro</p>
            <div className="mt-4 text-6xl font-black tabular-nums">{active ? formatCountdown(focus[0]) : '25:00'}</div>
            <p className="mt-1 text-sm text-muted-foreground">{active ? 'Everyone is focusing together' : 'Ready when the room is ready'}</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="gradient" onClick={beginFocus} disabled={Boolean(active)}><Play className="h-4 w-4" /> Start 25 min</Button>
              <Button variant="outline" onClick={breakNow}><Square className="h-4 w-4" /> Break</Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between"><h2 className="font-semibold"><Users className="mr-2 inline h-4 w-4" />Students here</h2><span className="text-xs text-muted-foreground">{members.length}</span></div>
          <div className="mt-4 space-y-2">
            {members.map((m) => (
              <div key={m.uid} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{(m.displayName?.[0] || 'S').toUpperCase()}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.displayName}</p><p className="text-[11px] text-muted-foreground">{m.status === 'studying' ? 'Focusing now' : m.status === 'online' ? 'Online' : 'Away'}</p></div>
                <span className={m.status === 'studying' ? 'h-2.5 w-2.5 rounded-full bg-emerald-400' : 'h-2.5 w-2.5 rounded-full bg-muted-foreground/40'} />
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3 text-sm"><Radio className="h-4 w-4 text-primary" /><b>{studying.length}</b><span className="text-muted-foreground">students are currently studying in this room.</span><span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />Shared Pomodoro keeps the room in sync.</span></div>
      </GlassCard>
    </div>
  );
}

function formatCountdown(session: SharedFocusSession) {
  const ends = new Date((session.endsAt as any)?.toDate?.() ?? session.endsAt).getTime();
  const remaining = Math.max(0, ends - Date.now());
  const total = Math.floor(remaining / 1000);
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}