'use client';

import { useEffect, useState } from 'react';
import { User, Save, Users, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { getCommunityProfile, upsertCommunityProfile } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

const EXAMS = ['UPSSSC PET','SSC CGL','SSC CHSL','UPSC','Banking','NEET','JEE','Other'];
const SUBJECTS = ['General Studies','Maths','Reasoning','English','Hindi','Science','History','Geography','Polity','Economy'];

export default function CommunityProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getCommunityProfile(user.uid).then((p) => setProfile(p || {
      uid: user.uid, displayName: user.displayName || 'Student', photoURL: user.photoURL || null,
      state: null, exam: 'UPSSSC PET', subjects: [], isOnline: true, lastSeenAt: null,
      bio: '', studyMinutes: 0, streak: 0, followersCount: 0, followingCount: 0
    }));
  }, [user]);

  if (!user || !profile) return <GlassCard><p className="text-sm text-muted-foreground">Loading profile…</p></GlassCard>;

  const toggleSubject = (subject: string) => setProfile(p => p ? ({ ...p, subjects: p.subjects.includes(subject) ? p.subjects.filter(x => x !== subject) : [...p.subjects, subject] }) : p);

  async function save() {
    setSaving(true);
    try { await upsertCommunityProfile(profile); toast.success('Community profile saved'); }
    catch { toast.error('Could not save profile'); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
    <div><p className="text-xs text-primary">Study Together / Profile</p><h1 className="text-2xl font-black">Your student profile</h1><p className="mt-1 text-sm text-muted-foreground">Help students with the same exam find you.</p></div>
    <GlassCard>
      <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-xl font-black text-white">{(profile.displayName?.[0] || 'S').toUpperCase()}</div><div><p className="font-bold">{profile.displayName}</p><p className="text-xs text-muted-foreground">{profile.uid === user.uid ? 'Your public StudySphere profile' : ''}</p></div></div>
      <label className="mt-6 block text-xs font-semibold">Display name</label><input value={profile.displayName} onChange={e=>setProfile({...profile,displayName:e.target.value.slice(0,60)})} className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm"/>
      <label className="mt-4 block text-xs font-semibold">State</label><input value={profile.state || ''} onChange={e=>setProfile({...profile,state:e.target.value.slice(0,40)})} placeholder="e.g. Uttar Pradesh" className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm"/>
      <label className="mt-4 block text-xs font-semibold">Exam</label><select value={profile.exam || ''} onChange={e=>setProfile({...profile,exam:e.target.value})} className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm"><option value="">Select exam</option>{EXAMS.map(x=><option key={x}>{x}</option>)}</select>
      <label className="mt-4 block text-xs font-semibold">Subjects</label><div className="mt-2 flex flex-wrap gap-2">{SUBJECTS.map(x=><button key={x} onClick={()=>toggleSubject(x)} className={profile.subjects.includes(x) ? 'rounded-full bg-primary/15 px-3 py-1.5 text-xs text-primary' : 'rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted-foreground'}>{x}</button>)}</div>
      <label className="mt-4 block text-xs font-semibold">Bio</label><textarea value={profile.bio || ''} onChange={e=>setProfile({...profile,bio:e.target.value.slice(0,160)})} placeholder="What are you preparing for?" className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background/60 p-3 text-sm"/>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-muted-foreground"><span><Flame className="mr-1 inline h-4 w-4 text-orange-400"/>{profile.streak || 0} day streak</span><span><Users className="mr-1 inline h-4 w-4 text-primary"/>{profile.followersCount || 0} followers</span></div>
      <Button className="mt-5" variant="gradient" onClick={save} disabled={saving}><Save className="h-4 w-4"/>{saving ? 'Saving…' : 'Save profile'}</Button>
    </GlassCard>
  </div>;
}
