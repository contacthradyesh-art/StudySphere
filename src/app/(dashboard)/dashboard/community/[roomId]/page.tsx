'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock3, Play, Users, Radio, Square, LogOut, Send, Flag, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { joinStudyRoom, leaveStudyRoom, subscribeRoomMembers, subscribeSharedFocus, updateRoomPresence, startSharedFocus, stopSharedFocus, subscribeRoomMessages, sendRoomMessage, reportRoomUser, followStudent, unfollowStudent, isFollowingStudent } from '@/lib/community/study-room-service';
import type { RoomMember, SharedFocusSession, RoomMessage } from '@/lib/firestore/community-schema';

export default function StudyRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [focus, setFocus] = useState<SharedFocusSession[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const activeSession = focus[0];
  const activeEnds = activeSession ? timestampMs(activeSession.endsAt) : 0;
  const active = Boolean(activeSession && activeEnds > Date.now());

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

  useEffect(() => {
    if (!user || !roomId) return;
    const profile = profileFor(user);
    joinStudyRoom(roomId, profile).then(() => setJoined(true)).catch(() => toast.error('Could not join room'));
    return () => { void leaveStudyRoom(roomId, user.uid); };
  }, [user, roomId]);

  useEffect(() => {
    if (!user || !roomId || !joined) return;
    const profile = profileFor(user);
    void updateRoomPresence(roomId, profile, active ? 'studying' : 'online');
    const heartbeat = window.setInterval(() => void updateRoomPresence(roomId, profile, active ? 'studying' : 'online'), 30000);
    return () => window.clearInterval(heartbeat);
  }, [user, roomId, joined, active]);

  async function beginFocus() {
    if (!user || !roomId) return;
    try {
      await startSharedFocus(roomId, user.uid, 25, null);
      await updateRoomPresence(roomId, profileFor(user), 'studying');
      toast.success('Shared Pomodoro started');
    } catch { toast.error('Could not start shared focus'); }
  }

  async function breakNow() {
    if (!user || !roomId) return;
    try {
      await stopSharedFocus(roomId, user.uid);
      await updateRoomPresence(roomId, profileFor(user), 'online');
    } catch { toast.error('Could not switch to break'); }
  }

  async function sendMessage() {
    if (!user || !roomId || !message.trim()) return;
    try { await sendRoomMessage(roomId, profileFor(user), message); setMessage(''); }
    catch { toast.error('Message could not be sent'); }
  }

  async function toggleFollow(targetUid: string) {
    if (!user || targetUid === user.uid) return;
    const next = !following[targetUid];
    setFollowing((s) => ({ ...s, [targetUid]: next }));
    try { if (next) await followStudent(user.uid, targetUid); else await unfollowStudent(user.uid, targetUid); }
    catch { setFollowing((s) => ({ ...s, [targetUid]: !next })); toast.error('Could not update connection'); }
  }

  async function report(targetUid: string) {
    if (!user || targetUid === user.uid) return;
    const reason = window.prompt('Reason for report?');
    if (!reason) return;
    try { await reportRoomUser(roomId, user.uid, targetUid, reason); toast.success('Report submitted'); }
    catch { toast.error('Could not submit report'); }
  }

  const studying = members.filter((m) => m.status === 'studying');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-primary">Community / Study Room</p><h1 className="text-2xl font-bold">Live Study Room</h1></div><Button variant="outline" onClick={() => window.location.href = '/dashboard/community'}><LogOut className="h-4 w-4" /> Leave</Button></div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18),transparent_50%)]" /><div className="relative text-center"><p className="text-xs uppercase tracking-[0.16em] text-violet-300">Shared Pomodoro</p><div className="mt-4 text-6xl font-black tabular-nums">{active ? formatMs(remaining) : '25:00'}</div><p className="mt-1 text-sm text-muted-foreground">{active ? 'Everyone is focusing together' : 'Start a 25-minute room session'}</p><div className="mt-6 flex justify-center gap-2"><Button variant="gradient" onClick={beginFocus} disabled={!joined || active}><Play className="h-4 w-4" /> Start 25 min</Button><Button variant="outline" onClick={breakNow}><Square className="h-4 w-4" /> 5m break</Button></div></div></GlassCard>

        <GlassCard><div className="flex items-center justify-between"><h2 className="font-semibold"><Users className="mr-2 inline h-4 w-4" />Students here</h2><span className="text-xs text-muted-foreground">{members.filter(m => m.status !== 'away').length}</span></div><div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{members.filter(m => m.status !== 'away').map((m) => <div key={m.uid} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{(m.displayName?.[0] || 'S').toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.displayName}</p><p className="text-[11px] text-muted-foreground">{m.status === 'studying' ? 'Focusing now' : 'Online'}</p></div>{user && m.uid !== user.uid && <><button title={following[m.uid] ? 'Disconnect' : 'Connect'} onClick={() => toggleFollow(m.uid)} className="rounded-lg p-1.5 text-primary hover:bg-primary/10">{following[m.uid] ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}</button><button title="Report" onClick={() => report(m.uid)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"><Flag className="h-4 w-4" /></button></>}</div>)}</div><div className="mt-3 text-xs text-muted-foreground"><b>{studying.length}</b> students focusing right now.</div></GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <GlassCard><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-primary" /><h2 className="font-semibold">Room chat</h2><span className="ml-auto text-[11px] text-muted-foreground">Messages are limited to 500 characters</span></div><div className="mt-4 h-72 overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/10 p-3">{messages.length === 0 ? <p className="grid h-full place-items-center text-sm text-muted-foreground">Say hello and start studying together.</p> : <div className="space-y-2">{messages.map(m => <div key={m.id} className={m.uid === user?.uid ? 'ml-auto max-w-[85%] rounded-2xl bg-primary/15 p-3' : 'max-w-[85%] rounded-2xl bg-white/[0.05] p-3'}><p className="text-[11px] font-semibold text-primary">{m.displayName}</p><p className="mt-1 break-words text-sm">{m.text}</p></div>)}</div>}</div><form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="mt-3 flex gap-2"><input value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder="Message the room..." className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm" /><Button type="submit" variant="gradient" disabled={!message.trim()}><Send className="h-4 w-4" /></Button></form></GlassCard>
        <GlassCard><h2 className="font-semibold">Study rules</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>• Keep chat study-related.</li><li>• Respect other students.</li><li>• Use Report if someone is abusive or disruptive.</li><li>• Start the shared Pomodoro when everyone is ready.</li></ul><div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">StudySphere is designed for focused learning, not social-media scrolling.</div></GlassCard>
      </section>
    </div>
  );
}

function profileFor(user: { uid: string; displayName?: string | null; photoURL?: string | null }) {
  return { uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL || null, state: null, exam: null, subjects: [], isOnline: true, lastSeenAt: null };
}
function timestampMs(value: any) { return typeof value?.toMillis === 'function' ? value.toMillis() : new Date(value).getTime(); }
function formatMs(ms: number) { const total = Math.floor(Math.max(0, ms) / 1000); return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`; }