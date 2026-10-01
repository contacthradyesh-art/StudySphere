'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock3, Play, Users, Radio, Square, LogOut, Send, Flag, UserPlus, UserMinus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import {
  joinStudyRoom,
  leaveStudyRoom,
  subscribeStudyRoom,
  subscribeRoomMembers,
  subscribeSharedFocus,
  updateRoomPresence,
  startSharedFocus,
  stopSharedFocus,
  subscribeRoomMessages,
  sendRoomMessage,
  reportRoomUser,
  followStudent,
  unfollowStudent,
  recordCommunityStudy,
  reconcileRoomParticipantCount,
} from '@/lib/community/study-room-service';
import type { RoomMember, SharedFocusSession, RoomMessage, StudyRoom } from '@/lib/firestore/community-schema';

const STALE_MS = 90_000;

export default function StudyRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [focus, setFocus] = useState<SharedFocusSession[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [roomReady, setRoomReady] = useState(false);

  const observedSessionRef = useRef<{ id: string; startedAt: number; endedAt: number } | null>(null);
  const recordedSessionIdsRef = useRef<Set<string>>(new Set());
  const joinedRef = useRef(false);

  const activeSession = focus[0];
  const activeEnds = activeSession ? timestampMs(activeSession.endsAt) : 0;
  const active = Boolean(activeSession && activeSession.phase === 'focus' && activeEnds > Date.now());

  useEffect(() => {
    if (!roomId) return;
    setRoomLoading(true);
    const unsubscribe = subscribeStudyRoom(roomId, (next) => {
      setRoom(next);
      setRoomLoading(false);
      setRoomError(false);
      setRoomReady(Boolean(next));
      if (next && user?.uid && next.removedUids?.includes(user.uid)) {
        setRemoved(true);
        setJoined(false);
      }
    }, () => {
      setRoomLoading(false);
      setRoomError(true);
    });
    return unsubscribe;
  }, [roomId, user?.uid]);

  useEffect(() => {
    if (!roomId) return;
    const a = subscribeRoomMembers(roomId, setMembers);
    const b = subscribeSharedFocus(roomId, setFocus);
    const c = subscribeRoomMessages(roomId, setMessages);
    return () => { a(); b(); c(); };
  }, [roomId]);

  useEffect(() => {
    if (!activeEnds) { setRemaining(0); return; }
    const tick = () => setRemaining(Math.max(0, activeEnds - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [activeEnds]);

  async function recordObservedSession(endMs = Date.now()) {
    const observed = observedSessionRef.current;
    if (!observed || !user || recordedSessionIdsRef.current.has(observed.id)) return;
    recordedSessionIdsRef.current.add(observed.id);
    const elapsed = Math.max(1, Math.floor((Math.min(endMs, observed.endedAt) - observed.startedAt) / 60000));
    try {
      await recordCommunityStudy(user.uid, elapsed, observed.id);
    } catch (error) {
      recordedSessionIdsRef.current.delete(observed.id);
      console.error('Could not record community study:', error);
    }
    observedSessionRef.current = null;
  }

  useEffect(() => {
    if (!joined || !user) return;
    if (activeSession?.phase === 'focus' && activeEnds > Date.now()) {
      const startedAt = timestampMs(activeSession.createdAt) || Date.now();
      observedSessionRef.current = {
        id: activeSession.id,
        startedAt: Math.min(startedAt, Date.now()),
        endedAt: activeEnds,
      };
      return;
    }
    if (observedSessionRef.current) void recordObservedSession();
  }, [active, activeSession?.id, activeSession?.phase, activeEnds, joined, user]);

  useEffect(() => {
    if (!user || !roomId || !roomReady || removed || room?.active === false) return;
    let cancelled = false;
    const profile = profileFor(user);
    joinStudyRoom(roomId, profile)
      .then(() => {
        if (!cancelled) {
          joinedRef.current = true;
          setJoined(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setJoined(false);
          toast.error(error instanceof Error ? error.message.slice(0, 160) : 'Could not join room / रूम में शामिल नहीं हो सके');
        }
      });
    return () => {
      cancelled = true;
      if (joinedRef.current) {
        joinedRef.current = false;
        void leaveStudyRoom(roomId, user.uid);
      }
    };
  }, [user, roomId, roomReady, removed, room?.active]);

  useEffect(() => {
    if (!user || !roomId || !joined || removed) return;
    const profile = profileFor(user);
    void updateRoomPresence(roomId, profile, active ? 'studying' : 'online');
    void reconcileRoomParticipantCount(roomId);
    const heartbeat = window.setInterval(() => {
      void updateRoomPresence(roomId, profile, active ? 'studying' : 'online');
      void reconcileRoomParticipantCount(roomId);
    }, 30_000);
    const leave = () => { void leaveStudyRoom(roomId, user.uid); };
    window.addEventListener('pagehide', leave);
    window.addEventListener('beforeunload', leave);
    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('beforeunload', leave);
    };
  }, [user, roomId, joined, removed, active]);

  async function beginFocus() {
    if (!user || !roomId || !joined || removed) return;
    try {
      await startSharedFocus(roomId, user.uid, 25, null);
      await updateRoomPresence(roomId, profileFor(user), 'studying');
      toast.success('Shared focus started / साझा फोकस शुरू');
    } catch (error) {
      toast.error(error instanceof Error ? error.message.slice(0, 140) : 'Could not start focus / फोकस शुरू नहीं हो पाया');
    }
  }

  async function breakNow() {
    if (!user || !roomId || !joined || removed) return;
    try {
      await recordObservedSession();
      await stopSharedFocus(roomId, user.uid);
      await updateRoomPresence(roomId, profileFor(user), 'online');
    } catch (error) {
      toast.error(error instanceof Error ? error.message.slice(0, 140) : 'Could not switch to break / ब्रेक शुरू नहीं हो पाया');
    }
  }

  async function sendMessage() {
    if (!user || !roomId || !message.trim() || removed) return;
    try { await sendRoomMessage(roomId, profileFor(user), message); setMessage(''); }
    catch { toast.error('Message could not be sent / संदेश नहीं भेजा जा सका'); }
  }

  async function report(targetUid: string) {
    if (!user || targetUid === user.uid) return;
    const reason = window.prompt('Reason for report / रिपोर्ट का कारण?');
    if (!reason) return;
    try { await reportRoomUser(roomId, user.uid, targetUid, reason); toast.success('Report submitted / रिपोर्ट भेज दी गई'); }
    catch { toast.error('Could not submit report / रिपोर्ट नहीं भेजी जा सकी'); }
  }

  const visibleMembers = useMemo(
    () => members.filter((m) => m.status !== 'away' && timestampMs(m.lastSeenAt) >= Date.now() - STALE_MS),
    [members],
  );
  const studying = visibleMembers.filter((m) => m.status === 'studying');

  if (roomLoading) {
    return <GlassCard className="mx-auto mt-8 max-w-2xl"><p className="text-sm text-muted-foreground">Loading study room… / स्टडी रूम लोड हो रहा है…</p></GlassCard>;
  }

  if (roomError || !room) {
    return <GlassCard className="mx-auto mt-8 max-w-2xl text-center"><p className="text-lg font-bold">Room not found / रूम नहीं मिला</p><p className="mt-2 text-sm text-muted-foreground">This study room may have been deleted or is unavailable.</p><Button className="mt-5" variant="outline" onClick={() => window.location.href = '/dashboard/community'}><ArrowLeft className="h-4 w-4" /> Back / वापस</Button></GlassCard>;
  }

  if (!room.active) {
    return <GlassCard className="mx-auto mt-8 max-w-2xl text-center"><p className="text-lg font-bold">Room closed / रूम बंद है</p><p className="mt-2 text-sm text-muted-foreground">The host has closed this study room.</p><Button className="mt-5" variant="outline" onClick={() => window.location.href = '/dashboard/community'}><ArrowLeft className="h-4 w-4" /> Back / वापस</Button></GlassCard>;
  }

  if (removed) {
    return <GlassCard className="mx-auto mt-8 max-w-2xl text-center"><p className="text-lg font-bold">You were removed from this room / आपको इस रूम से हटा दिया गया है</p><p className="mt-2 text-sm text-muted-foreground">You cannot rejoin this room unless the host changes the moderation decision.</p><Button className="mt-5" variant="outline" onClick={() => window.location.href = '/dashboard/community'}><ArrowLeft className="h-4 w-4" /> Back / वापस</Button></GlassCard>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-primary">Community / Study Together</p><h1 className="text-2xl font-bold">Live Study Room / लाइव स्टडी रूम</h1><p className="text-xs text-muted-foreground">{room.name}</p></div><Button variant="outline" onClick={() => window.location.href = '/dashboard/community'}><LogOut className="h-4 w-4" /> Leave / बाहर निकलें</Button></div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18),transparent_50%)]" /><div className="relative text-center"><p className="text-xs uppercase tracking-[0.16em] text-violet-300">Shared Pomodoro / साझा पोमोडोरो</p><div className="mt-4 text-6xl font-black tabular-nums">{active ? formatMs(remaining) : '25:00'}</div><p className="mt-1 text-sm text-muted-foreground">{active ? 'Everyone is focusing together / सभी साथ में फोकस कर रहे हैं' : 'Start a 25-minute room session / 25 मिनट का सत्र शुरू करें'}</p><div className="mt-6 flex justify-center gap-2"><Button variant="gradient" onClick={beginFocus} disabled={!joined || active}><Play className="h-4 w-4" /> Start 25 min / शुरू करें</Button><Button variant="outline" onClick={breakNow} disabled={!joined}><Square className="h-4 w-4" /> 5m break / 5 मिनट ब्रेक</Button></div></div></GlassCard>

        <GlassCard><div className="flex items-center justify-between"><h2 className="font-semibold"><Users className="mr-2 inline h-4 w-4" />Students here / यहाँ छात्र</h2><span className="text-xs text-muted-foreground">{visibleMembers.length}</span></div><div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{visibleMembers.map((m) => <div key={m.uid} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{(m.displayName?.[0] || 'S').toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.displayName}</p><p className="text-[11px] text-muted-foreground">{m.status === 'studying' ? 'Focusing now / अभी फोकस' : 'Online / ऑनलाइन'}</p></div>{user && m.uid !== user.uid && <><button title={following[m.uid] ? 'Disconnect / कनेक्शन हटाएँ' : 'Connect / जुड़ें'} onClick={() => { const next = !following[m.uid]; setFollowing((s) => ({ ...s, [m.uid]: next })); void (next ? followStudent(user.uid, m.uid) : unfollowStudent(user.uid, m.uid)); }} className="rounded-lg p-1.5 text-primary hover:bg-primary/10">{following[m.uid] ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}</button><button title="Report / रिपोर्ट" onClick={() => void report(m.uid)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"><Flag className="h-4 w-4" /></button></>}</div>)}</div><div className="mt-3 text-xs text-muted-foreground"><b>{studying.length}</b> students focusing / छात्र अभी फोकस कर रहे हैं।</div></GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <GlassCard><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-primary" /><h2 className="font-semibold">Room chat / रूम चैट</h2><span className="ml-auto text-[11px] text-muted-foreground">500 chars max / 500 अक्षर</span></div><div className="mt-4 h-72 overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/10 p-3">{messages.length === 0 ? <p className="grid h-full place-items-center text-sm text-muted-foreground">Say hello and start studying / नमस्ते कहें और साथ पढ़ना शुरू करें।</p> : <div className="space-y-2">{messages.map(m => <div key={m.id} className={m.uid === user?.uid ? 'ml-auto max-w-[85%] rounded-2xl bg-primary/15 p-3' : 'max-w-[85%] rounded-2xl bg-white/[0.05] p-3'}><p className="text-[11px] font-semibold text-primary">{m.displayName}</p><p className="mt-1 break-words text-sm">{m.text}</p></div>)}</div>}</div><form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="mt-3 flex gap-2"><input value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder="Message / संदेश..." className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm" /><Button type="submit" variant="gradient" disabled={!message.trim()}><Send className="h-4 w-4" /></Button></form></GlassCard>
        <GlassCard><h2 className="font-semibold">Study rules / अध्ययन नियम</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>• Keep chat study-related / चैट को पढ़ाई तक रखें।</li><li>• Respect other students / दूसरे छात्रों का सम्मान करें।</li><li>• Report abusive behaviour / गलत व्यवहार की रिपोर्ट करें।</li><li>• Start shared focus when ready / तैयार होने पर साझा फोकस शुरू करें।</li></ul><div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">StudySphere is for focused learning, not scrolling / StudySphere फोकस्ड पढ़ाई के लिए है।</div></GlassCard>
      </section>
    </div>
  );
}

function profileFor(user: { uid: string; displayName?: string | null; photoURL?: string | null }) {
  return { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL || null, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null };
}
function timestampMs(value: any) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}
function formatMs(ms: number) { const total = Math.floor(Math.max(0, ms) / 1000); return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`; }
