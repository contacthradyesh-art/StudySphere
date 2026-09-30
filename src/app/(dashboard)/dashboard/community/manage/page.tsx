'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { findMyRooms, subscribeRoomReports, removeRoomMember, closeStudyRoom } from '@/lib/community/study-room-service';
import type { StudyRoom } from '@/lib/firestore/community-schema';

type RoomReport = { id: string; reporterUid: string; reportedUid: string; reason: string; createdAt: unknown };

export default function CommunityManagePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [selected, setSelected] = useState('');
  const [reports, setReports] = useState<RoomReport[]>([]);

  useEffect(()=>{ if(user)void findMyRooms(user.uid).then(setRooms).catch(()=>setRooms([])); },[user]);
  useEffect(()=>{ if(!selected)return; return subscribeRoomReports(selected,setReports); },[selected]);

  async function closeRoom(){ if(!selected)return; try{await closeStudyRoom(selected);setRooms(r=>r.map(x=>x.id===selected?{...x,active:false}:x));toast.success('Room closed');}catch{toast.error('Could not close room');} }
  async function remove(uid:string){ if(!selected)return; try{await removeRoomMember(selected,uid);toast.success('Student removed from the active room');}catch{toast.error('Could not moderate student');} }

  return <div className="space-y-5">
    <div><p className="text-xs text-primary">Study Together / Host tools</p><h1 className="text-2xl font-black">Room moderation</h1><p className="mt-1 text-sm text-muted-foreground">Review reports and keep your study rooms focused.</p></div>
    <GlassCard><label className="text-xs font-semibold">Your rooms</label><select value={selected} onChange={e=>setSelected(e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm"><option value="">Select a room</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name} · {r.active?'Active':'Closed'}</option>)}</select></GlassCard>
    {selected&&<section className="grid gap-4 lg:grid-cols-[1fr_340px]"><GlassCard><div className="flex items-center justify-between"><h2 className="font-semibold"><ShieldAlert className="mr-2 inline h-4 w-4 text-orange-400"/>Reports</h2><Button variant="outline" onClick={closeRoom} disabled={!rooms.find(r=>r.id===selected)?.active}><XCircle className="h-4 w-4"/> Close room</Button></div><div className="mt-4 space-y-2">{reports.length===0?<p className="text-sm text-muted-foreground">No reports.</p>:reports.map(r=><div key={r.id} className="rounded-xl border border-white/[0.06] p-3"><p className="text-sm"><b>{r.reportedUid}</b> reported: {r.reason}</p><p className="mt-1 text-[11px] text-muted-foreground">Reporter: {r.reporterUid}</p><Button className="mt-2" size="sm" variant="outline" onClick={()=>remove(r.reportedUid)}><Users className="h-3.5 w-3.5"/> Remove from room</Button></div>)}</div></GlassCard><GlassCard><h2 className="font-semibold">Host controls</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>• Review user reports.</li><li>• Remove disruptive participants.</li><li>• Close a room when the session is finished.</li><li>• Keep the community study-focused.</li></ul><Link href="/dashboard/community" className="mt-4 inline-block text-xs font-semibold text-primary">Back to Study Together</Link></GlassCard></section>}
  </div>;
}