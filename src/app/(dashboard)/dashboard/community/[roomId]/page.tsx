'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock3, Play, Users, Radio, Square, LogOut, Send, Flag, UserPlus, UserMinus, ArrowLeft, MessageCircle, Video, MicOff, ShieldCheck, Coffee, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
    return () => { a(); b(); };
  }, [roomId]);

  // Messages are readable only by room members (Firestore rules), so listen after joining.
  useEffect(() => {
    if (!roomId || !joined || removed) return;
    return subscribeRoomMessages(roomId, setMessages);
  }, [roomId, joined, removed]);

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

  const hostName = room.host?.displayName || 'Room host';
  const roomTitle = room.name || `${hostName}'s Study Room`;
  const participantCount = visibleMembers.length || room.participantCount || 0;

  return (
    <div className="min-h-full bg-[#0A0A0F] text-white animate-fade-in">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[18%] top-10 h-80 w-80 rounded-full bg-[#8B5CF6]/10 blur-[120px]" />
        <div className="absolute right-[-12%] top-[35%] h-96 w-96 rounded-full bg-[#EC4899]/8 blur-[130px]" />
      </div>

      <main className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-3 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/[0.05] bg-[#0A0A0F]/85 px-4 pb-4 pt-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
              <span>Community</span><ChevronRight className="h-3 w-3 text-white/20" /><span className="text-white/60">Study Together</span>
            </div>
            <button type="button" onClick={() => window.location.href='/dashboard/community'} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/65 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
              <LogOut className="h-3.5 w-3.5" /> बाहर निकलें
            </button>
          </div>
          <div className="mt-3 space-y-1">
            <h1 className="text-[27px] font-black leading-[1.05] tracking-[-0.03em]">Live Study Room<span className="mt-1 block text-[14px] font-medium tracking-normal text-white/40">लाइव स्टडी रूम</span></h1>
            <div className="flex items-center gap-2.5 pt-1.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] p-[1.5px]"><div className="grid h-full w-full place-items-center rounded-full bg-[#1A1A20] text-[10px] font-bold">{hostName.slice(0,1).toUpperCase()}</div></div>
              <span className="truncate text-[13px] font-medium text-white/80">{roomTitle}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#A78BFA]"><ShieldCheck className="h-2.5 w-2.5" /> HOSTED</span>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.025] shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_70px_rgba(139,92,246,0.10)] backdrop-blur-2xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05]"><Clock3 className="h-4 w-4 text-white/70" /></div>
                  <div><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Shared Pomodoro</div><div className="text-[11px] text-white/30">साझा पोमोडोरो</div></div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/15 bg-[#10B981]/10 px-2.5 py-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" /><span className="text-[10px] font-bold tracking-wide text-[#6EE7B7]">LIVE</span></div>
              </div>

              <div className="relative flex flex-col items-center py-1">
                <div className="absolute left-1/2 top-1/2 h-28 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#8B5CF6]/35 to-[#EC4899]/25 blur-[45px]" />
                <div className="relative text-center">
                  <div className="text-[68px] font-black leading-none tracking-[-0.05em] tabular-nums text-white sm:text-[78px]" style={{ textShadow:'0 0 40px rgba(139,92,246,0.35)' }}>{active ? formatMs(remaining) : '25:00'}</div>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[12px] font-medium tracking-wide text-white/45"><Sparkles className="h-3 w-3 text-[#A78BFA]" />{active ? 'Everyone is focusing together • सभी साथ में फोकस कर रहे हैं' : 'Start a 25-min room session • शुरू करें'}</div>
                </div>
              </div>

              <div className="my-5 flex justify-center gap-1.5">{[0,1,2,3].map((n) => <div key={n} className={`h-1 rounded-full transition-all ${n===0 ? 'w-6 bg-white' : 'w-1 bg-white/15'}`} />)}</div>

              <div className="grid grid-cols-[1.4fr_0.9fr] gap-2.5">
                <button type="button" onClick={beginFocus} disabled={!joined || active} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-[13px] font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-45"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/20"><Play className="ml-0.5 h-3 w-3 fill-white" /></span>शुरू करें • Start 25 min</button>
                <button type="button" onClick={breakNow} disabled={!joined} className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] text-[12px] font-medium text-white/65 transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><Coffee className="h-3.5 w-3.5" /> 5m break</button>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06] bg-black/20">
              <RoomStat label="Focus" value={active ? '1 active' : 'Ready'} />
              <RoomStat label="Streak" value="12 days" />
              <RoomStat label="Students" value={String(participantCount)} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-white/40" /><span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">Students Here</span><span className="text-[11px] text-white/25">• यहाँ छात्र</span></div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/15 bg-[#10B981]/10 px-2.5 py-1 text-[10px] font-semibold text-[#6EE7B7]"><span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> {participantCount} online</span>
            </div>
            <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-3.5 backdrop-blur-xl">
              {visibleMembers.length === 0 ? <div className="py-5 text-center text-sm text-white/35">You are the first student here • आप पहले छात्र हैं</div> : <div className="space-y-2">{visibleMembers.map((m) => <div key={m.uid} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3">
                <div className="flex min-w-0 items-center gap-3"><div className="relative"><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-xs font-bold ring-1 ring-white/10">{(m.displayName?.[0] || 'S').toUpperCase()}</div><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#14141A] bg-[#10B981]" /></div><div className="min-w-0"><div className="flex items-center gap-1.5"><p className="truncate text-[14px] font-semibold text-white">{m.displayName}</p>{m.uid === room.host?.uid && <span className="rounded-full bg-[#8B5CF6]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#A78BFA]">HOST</span>}</div><p className="mt-0.5 text-[11px] text-white/35"><span className="text-[#6EE7B7]">{m.status === 'studying' ? '● Focusing' : '● Online'}</span> • {m.status === 'studying' ? 'पढ़ रहा है' : 'available'}</p></div></div>
                <div className="flex shrink-0 items-center gap-1">{user && m.uid !== user.uid && <><button type="button" title={following[m.uid] ? 'Disconnect' : 'Connect'} onClick={() => { const next = !following[m.uid]; setFollowing((state) => ({ ...state, [m.uid]: next })); void (next ? followStudent(user.uid, m.uid) : unfollowStudent(user.uid, m.uid)); }} className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition hover:bg-white/[0.07] hover:text-white">{following[m.uid] ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}</button><button type="button" title="Report" onClick={() => void report(m.uid)} className="grid h-8 w-8 place-items-center rounded-full text-white/30 transition hover:bg-red-500/10 hover:text-red-300"><Flag className="h-3.5 w-3.5" /></button></>}</div>
              </div>)}</div>}
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[11px] text-white/30"><span><b className="text-white/60">{studying.length}</b> students focusing right now</span><span>{participantCount} online</span></div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1"><MessageCircle className="h-4 w-4 text-white/40" /><span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">Room Chat</span><span className="text-[11px] text-white/25">• बातचीत</span></div>
            <div className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
              <div className="min-h-[150px] space-y-3 p-4">
                {messages.length === 0 ? <div className="grid min-h-[120px] place-items-center text-center text-sm text-white/35"><div><MessageCircle className="mx-auto mb-2 h-5 w-5 text-white/20" /><p>Welcome to the room! Say hello and start studying 🌿</p><p className="mt-1 text-[11px] text-white/25">नमस्ते कहें और पढ़ना शुरू करें</p></div></div> : messages.map((m) => <div key={m.id} className={m.uid === user?.uid ? 'ml-auto max-w-[88%]' : 'max-w-[88%]'}><div className={m.uid === user?.uid ? 'rounded-2xl rounded-tr-sm bg-[#8B5CF6]/15 px-3.5 py-2.5' : 'rounded-2xl rounded-tl-sm border border-white/[0.05] bg-white/[0.06] px-3.5 py-2.5'}><p className="text-[11px] font-semibold text-[#A78BFA]">{m.displayName}</p><p className="mt-1 break-words text-[13px] leading-[1.45] text-white/80">{m.text}</p></div><p className="mt-1 px-1 text-[9px] text-white/25">{m.uid === user?.uid ? 'You' : 'Student'}</p></div>)}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="border-t border-white/[0.06] bg-black/20 p-2.5">
                <div className="flex items-center gap-2"><input value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder="Say hello and start studying..." className="h-[42px] min-w-0 flex-1 rounded-full border border-white/[0.08] bg-white/[0.06] px-4 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#8B5CF6]/40 focus:bg-white/[0.08]" /><button type="submit" disabled={!message.trim()} className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white shadow-[0_0_16px_rgba(139,92,246,0.35)] disabled:opacity-40"><Send className="h-4 w-4" /></button></div>
              </form>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1"><ShieldCheck className="h-4 w-4 text-white/40" /><span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">Study Rules</span><span className="text-[11px] text-white/25">• नियम</span></div>
            <div className="grid gap-2.5 rounded-[20px] border border-white/[0.05] bg-white/[0.02] p-4 sm:grid-cols-3">
              <Rule icon={Video} title="Keep your camera on while studying" hi="पढ़ते समय कैमरा ऑन रखें" />
              <Rule icon={MicOff} title="Mute mic unless asking" hi="पूछने तक माइक म्यूट रखें" />
              <Rule icon={Clock3} title="Respect Pomodoro breaks" hi="ब्रेक का सम्मान करें" />
            </div>
          </section>

          <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-white/20"><Radio className="h-3 w-3" /> StudySphere • focused learning room</div>
        </div>
      </main>
    </div>
  );
}

function RoomStat({ label, value }: { label: string; value: string }) {
  return <div className="py-3 text-center"><div className="text-[9px] font-medium uppercase tracking-widest text-white/25">{label}</div><div className="mt-0.5 text-[12px] font-semibold text-white/70">{value}</div></div>;
}

function Rule({ icon: Icon, title, hi }: { icon: typeof Video; title: string; hi: string }) {
  return <div className="flex gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-3"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-white/[0.05]"><Icon className="h-3.5 w-3.5 text-white/50" /></div><div><div className="text-[12px] font-medium leading-[1.4] text-white/75">{title}</div><div className="mt-0.5 text-[10px] text-white/30">{hi}</div></div></div>;
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
