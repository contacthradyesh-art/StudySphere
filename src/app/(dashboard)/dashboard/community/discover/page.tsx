'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, UserMinus, MapPin, BookOpen, User } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { followStudent, isFollowingStudent, searchCommunityStudents, unfollowStudent } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

const EXAMS=['UPSSSC PET','SSC CGL','SSC CHSL','UPSC','Banking','NEET','JEE','Other'];
const SUBJECTS=['General Studies','Maths','Reasoning','English','Hindi','Science','History','Geography','Polity','Economy'];

export default function DiscoverStudentsPage(){
  const {user}=useAuth();
  const [rows,setRows]=useState<CommunityProfile[]>([]);
  const [exam,setExam]=useState('');
  const [subject,setSubject]=useState('');
  const [state,setState]=useState('');
  const [text,setText]=useState('');
  const [following,setFollowing]=useState<Record<string,boolean>>({});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(false);

  async function search(){
    setLoading(true);
    try{ setError(false); const result=await searchCommunityStudents({exam:exam||undefined,subject:subject||undefined,state:state.trim()||undefined,text}); setRows(result.filter(p=>p.uid!==user?.uid)); }
    catch{setError(true);toast.error('Could not load students / छात्र लोड नहीं हो सके');}
    finally{setLoading(false);}
  }
  useEffect(()=>{void search();},[exam,subject,state]);
  useEffect(()=>{ if(!user) return; void Promise.all(rows.map(p=>isFollowingStudent(user.uid,p.uid).then(v=>[p.uid,v] as const))).then(items=>setFollowing(Object.fromEntries(items))); },[user,rows]);

  async function toggle(p:CommunityProfile){
    if(!user)return;
    const next=!following[p.uid]; setFollowing(s=>({...s,[p.uid]:next}));
    try{if(next)await followStudent(user.uid,p.uid,user.displayName||'A student');else await unfollowStudent(user.uid,p.uid);}
    catch{setFollowing(s=>({...s,[p.uid]:!next}));toast.error('Could not update connection');}
  }

  return <div className="space-y-5">
    <div><p className="text-xs text-primary">Study Together / Discover</p><h1 className="text-2xl font-black">Find students</h1><p className="mt-1 text-sm text-muted-foreground">Search students preparing for the same exam and subjects.</p></div>
    <GlassCard><div className="grid gap-2 md:grid-cols-[1fr_180px_180px_160px_auto]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void search()} placeholder="Name, exam, subject..." className="h-10 w-full rounded-xl border border-input bg-background/60 pl-9 pr-3 text-sm"/></div>
      <select value={exam} onChange={e=>setExam(e.target.value)} className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm"><option value="">All exams</option>{EXAMS.map(x=><option key={x}>{x}</option>)}</select>
      <select value={subject} onChange={e=>setSubject(e.target.value)} className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm"><option value="">All subjects</option>{SUBJECTS.map(x=><option key={x}>{x}</option>)}</select>
      <input value={state} onChange={e=>setState(e.target.value)} placeholder="State" className="h-10 rounded-xl border border-input bg-background/60 px-3 text-sm"/>
      <Button variant="gradient" onClick={()=>void search()} disabled={loading}>{loading?'Searching…':'Search'}</Button>
    </div></GlassCard>
    {error?<GlassCard><p className="font-semibold">Could not load students / छात्र लोड नहीं हो सके</p><p className="mt-1 text-sm text-muted-foreground">Please try again / फिर प्रयास करें।</p></GlassCard>:rows.length===0?<GlassCard><User className="h-5 w-5 text-primary"/><p className="mt-3 font-semibold">No matching public profiles</p><p className="mt-1 text-sm text-muted-foreground">Try another exam, subject or state.</p></GlassCard>:
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(p=><GlassCard key={p.uid}><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-white">{(p.displayName?.[0]||'S').toUpperCase()}</div><div className="min-w-0 flex-1"><Link href={`/dashboard/community/student/${p.uid}`} className="truncate font-semibold hover:text-primary">{p.displayName}</Link><p className="text-xs text-muted-foreground"><BookOpen className="mr-1 inline h-3.5 w-3.5"/>{p.exam||'Student'}</p><p className="text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3.5 w-3.5"/>{p.state||'India'}</p></div></div><p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{p.bio||'Focused student on StudySphere.'}</p><div className="mt-3 flex flex-wrap gap-1">{(p.subjects||[]).slice(0,3).map(s=><span key={s} className="rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">{s}</span>)}</div><Button className="mt-4 w-full" variant={following[p.uid]?'outline':'gradient'} onClick={()=>void toggle(p)}>{following[p.uid]?<><UserMinus className="h-4 w-4"/> Connected</>:<><UserPlus className="h-4 w-4"/> Connect</>}</Button></GlassCard>)}</div>}
  </div>;
}