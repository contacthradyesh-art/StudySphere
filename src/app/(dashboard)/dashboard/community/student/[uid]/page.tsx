'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UserPlus, UserMinus, Flame, Clock3, MapPin, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { followStudent, getCommunityProfile, isFollowingStudent, unfollowStudent } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

export default function StudentProfilePage(){
  const {uid}=useParams<{uid:string}>(); const {user}=useAuth(); const [profile,setProfile]=useState<CommunityProfile|null>(null); const [following,setFollowing]=useState(false);
  useEffect(()=>{if(uid)void getCommunityProfile(uid).then(setProfile);},[uid]);
  useEffect(()=>{if(user&&uid&&user.uid!==uid)void isFollowingStudent(user.uid,uid).then(setFollowing);},[user,uid]);
  if(!profile)return <GlassCard><p className="text-sm text-muted-foreground">Loading profile…</p></GlassCard>;
  async function toggle(){if(!user||user.uid===uid)return;const next=!following;setFollowing(next);try{if(next)await followStudent(user.uid,uid,user.displayName||'A student');else await unfollowStudent(user.uid,uid);}catch{setFollowing(!next);toast.error('Could not update connection');}}
  return <div className="mx-auto max-w-2xl space-y-5"><GlassCard><div className="flex flex-wrap items-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-brand text-2xl font-black text-white">{(profile.displayName?.[0]||'S').toUpperCase()}</div><div className="min-w-0 flex-1"><h1 className="text-2xl font-black">{profile.displayName}</h1><p className="text-sm text-muted-foreground">{profile.exam||'Student'}</p><p className="mt-1 text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3.5 w-3.5"/>{profile.state||'India'}</p></div>{user&&user.uid!==uid&&<Button variant={following?'outline':'gradient'} onClick={()=>void toggle()}>{following?<><UserMinus className="h-4 w-4"/> Connected</>:<><UserPlus className="h-4 w-4"/> Connect</>}</Button>}</div><p className="mt-5 text-sm text-muted-foreground">{profile.bio||'Focused student on StudySphere.'}</p><div className="mt-4 flex flex-wrap gap-2">{(profile.subjects||[]).map(s=><span key={s} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">{s}</span>)}</div></GlassCard>
  <div className="grid gap-3 sm:grid-cols-3"><GlassCard><Flame className="h-4 w-4 text-orange-400"/><p className="mt-2 text-2xl font-black">{profile.streak||0}</p><p className="text-xs text-muted-foreground">day streak</p></GlassCard><GlassCard><Clock3 className="h-4 w-4 text-primary"/><p className="mt-2 text-2xl font-black">{Math.round((profile.studyMinutes||0)/60)}h</p><p className="text-xs text-muted-foreground">logged focus</p></GlassCard><GlassCard><BookOpen className="h-4 w-4 text-primary"/><p className="mt-2 text-2xl font-black">{profile.subjects?.length||0}</p><p className="text-xs text-muted-foreground">subjects</p></GlassCard></div></div>;
}