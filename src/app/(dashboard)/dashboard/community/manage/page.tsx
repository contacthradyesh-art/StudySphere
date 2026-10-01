'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { findMyRooms, subscribeRoomReports, subscribeRoomMembers, removeRoomMember, closeStudyRoom } from '@/lib/community/study-room-service';
import type { RoomMember, StudyRoom } from '@/lib/firestore/community-schema';

type RoomReport = { id: string; reporterUid: string; reportedUid: string; reason: string; createdAt: unknown };

export default function CommunityManagePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [selected, setSelected] = useState('');
  const [reports, setReports] = useState<RoomReport[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    void findMyRooms(user.uid).then(setRooms).catch(() => { setRooms([]); setError(true); }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selected) { setReports([]); setMembers([]); return; }
    const reportsUnsub = subscribeRoomReports(selected, setReports);
    const membersUnsub = subscribeRoomMembers(selected, setMembers);
    return () => { reportsUnsub(); membersUnsub(); };
  }, [selected]);

  const names = useMemo(() => new Map(members.map((m) => [m.uid, m.displayName || 'Student / छात्र'])), [members]);

  async function closeRoom() {
    if (!selected) return;
    try { await closeStudyRoom(selected); setRooms(r => r.map(x => x.id === selected ? { ...x, active: false } : x)); toast.success('Room closed / रूम बंद कर दिया गया'); }
    catch { toast.error('Could not close room / रूम बंद नहीं हो सका'); }
  }

  async function remove(uid: string) {
    if (!selected) return;
    try { await removeRoomMember(selected, uid); toast.success('Student removed / छात्र को रूम से हटा दिया गया'); }
    catch { toast.error('Could not moderate student / छात्र को मॉडरेट नहीं कर सके'); }
  }

  return <div className="space-y-5">
    <div><p className="text-xs text-primary">Study Together / साथ पढ़ें · Host tools / होस्ट टूल्स</p><h1 className="text-2xl font-black">Room moderation / रूम मॉडरेशन</h1><p className="mt-1 text-sm text-muted-foreground">Review reports and keep rooms focused / रिपोर्ट देखें और रूम को पढ़ाई-केंद्रित रखें।</p></div>
    {loading && <GlassCard><p className="text-sm text-muted-foreground">Loading rooms… / रूम लोड हो रहे हैं…</p></GlassCard>}
    {error && !loading && <GlassCard><p className="font-semibold">Could not load rooms / रूम लोड नहीं हो सके</p><p className="mt-1 text-sm text-muted-foreground">Please refresh and try again / रीफ्रेश करके फिर प्रयास करें।</p></GlassCard>}
    {!loading && !error && rooms.length === 0 && <GlassCard><p className="font-semibold">No rooms yet / अभी कोई रूम नहीं है</p><p className="mt-1 text-sm text-muted-foreground">Create a Study Together room first / पहले एक स्टडी रूम बनाएं।</p></GlassCard>}
    {!loading && rooms.length > 0 && <GlassCard><label className="text-xs font-semibold">Your rooms / आपके रूम</label><select value={selected} onChange={e=>setSelected(e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm"><option value="">Select a room / रूम चुनें</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name} · {r.active ? 'Active / चालू' : 'Closed / बंद'}</option>)}</select></GlassCard>}
    {selected&&<section className="grid gap-4 lg:grid-cols-[1fr_340px]"><GlassCard><div className="flex items-center justify-between"><h2 className="font-semibold"><ShieldAlert className="mr-2 inline h-4 w-4 text-orange-400"/>Reports / रिपोर्ट</h2><Button variant="outline" onClick={closeRoom} disabled={!rooms.find(r=>r.id===selected)?.active}><XCircle className="h-4 w-4"/> Close room / बंद करें</Button></div><div className="mt-4 space-y-2">{reports.length===0?<p className="text-sm text-muted-foreground">No reports / कोई रिपोर्ट नहीं।</p>:reports.map(r=><div key={r.id} className="rounded-xl border border-white/[0.06] p-3"><p className="text-sm"><b>{names.get(r.reportedUid) || 'Student / छात्र'}</b> ({r.reportedUid}) reported / रिपोर्ट: {r.reason}</p><p className="mt-1 text-[11px] text-muted-foreground">Reporter / रिपोर्टर: {names.get(r.reporterUid) || 'Student / छात्र'} ({r.reporterUid})</p><Button className="mt-2" size="sm" variant="outline" onClick={()=>void remove(r.reportedUid)}><Users className="h-3.5 w-3.5"/> Remove from room / हटाएँ</Button></div>)}</div></GlassCard><GlassCard><h2 className="font-semibold">Host controls / होस्ट कंट्रोल</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>• Review reports / रिपोर्ट देखें।</li><li>• Remove disruptive participants / अनुशासनहीन प्रतिभागी हटाएँ।</li><li>• Close a room / रूम बंद करें।</li><li>• Keep the community study-focused / समुदाय को पढ़ाई-केंद्रित रखें।</li></ul><Link href="/dashboard/community" className="mt-4 inline-block text-xs font-semibold text-primary">Back to Study Together / वापस</Link></GlassCard></section>}
  </div>;
}
