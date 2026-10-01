'use client';

import { useEffect, useState } from 'react';
import { Save, Users, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { getCommunityProfile, getFollowingCount, upsertCommunityProfile } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

const EXAMS = ['UPSSSC PET', 'SSC CGL', 'SSC CHSL', 'UPSC', 'Banking', 'NEET', 'JEE', 'Other'];
const SUBJECTS = ['General Studies', 'Maths', 'Reasoning', 'English', 'Hindi', 'Science', 'History', 'Geography', 'Polity', 'Economy'];

const emptyProfile = (uid: string, displayName: string | null, photoURL: string | null): CommunityProfile => ({
  uid,
  displayName: displayName || 'Student',
  photoURL,
  state: null,
  exam: 'UPSSSC PET',
  subjects: [],
  isOnline: true,
  lastSeenAt: null,
  bio: '',
  studyMinutes: 0,
  streak: 0,
  followersCount: 0,
  followingCount: 0,
});

export default function CommunityProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    Promise.all([
      getCommunityProfile(user.uid),
      getFollowingCount(user.uid),
    ]).then(([savedProfile, count]) => {
      if (cancelled) return;
      setProfile(savedProfile || emptyProfile(user.uid, user.displayName, user.photoURL));
      setFollowingCount(count);
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [user]);

  if (!user || loading) {
    return <GlassCard><p className="text-sm text-muted-foreground">Loading profile… / प्रोफ़ाइल लोड हो रही है…</p></GlassCard>;
  }

  if (loadError || !profile) {
    return <GlassCard><p className="font-semibold">Could not load profile / प्रोफ़ाइल लोड नहीं हो सकी</p><p className="mt-1 text-sm text-muted-foreground">Please refresh and try again / रीफ्रेश करके फिर प्रयास करें।</p></GlassCard>;
  }

  function toggleSubject(subject: string) {
    setProfile((current) => current ? {
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject],
    } : current);
  }

  async function save() {
    setSaving(true);
    try {
      await upsertCommunityProfile(profile);
      toast.success('Community profile saved / प्रोफ़ाइल सेव हो गई');
    } catch {
      toast.error('Could not save profile / प्रोफ़ाइल सेव नहीं हो सकी');
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
    <div>
      <p className="text-xs text-primary">Study Together / साथ पढ़ें · Profile / प्रोफ़ाइल</p>
      <h1 className="text-2xl font-black">Your student profile / आपकी छात्र प्रोफ़ाइल</h1>
      <p className="mt-1 text-sm text-muted-foreground">Help students with the same exam find you / समान परीक्षा वाले छात्र आपको खोज सकें।</p>
    </div>

    <GlassCard>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-xl font-black text-white">{(profile.displayName?.[0] || 'S').toUpperCase()}</div>
        <div><p className="font-bold">{profile.displayName}</p><p className="text-xs text-muted-foreground">Public StudySphere profile / सार्वजनिक प्रोफ़ाइल</p></div>
      </div>

      <label className="mt-6 block text-xs font-semibold">Display name / नाम</label>
      <input value={profile.displayName} onChange={(e) => setProfile((current) => current ? { ...current, displayName: e.target.value.slice(0, 60) } : current)} className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm" />

      <label className="mt-4 block text-xs font-semibold">State / राज्य</label>
      <input value={profile.state || ''} onChange={(e) => setProfile((current) => current ? { ...current, state: e.target.value.slice(0, 40) } : current)} placeholder="e.g. Uttar Pradesh / जैसे उत्तर प्रदेश" className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm" />

      <label className="mt-4 block text-xs font-semibold">Exam / परीक्षा</label>
      <select value={profile.exam || ''} onChange={(e) => setProfile((current) => current ? { ...current, exam: e.target.value } : current)} className="mt-2 h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm">
        <option value="">Select exam / परीक्षा चुनें</option>
        {EXAMS.map((item) => <option key={item}>{item}</option>)}
      </select>

      <label className="mt-4 block text-xs font-semibold">Subjects / विषय</label>
      <div className="mt-2 flex flex-wrap gap-2">{SUBJECTS.map((item) => <button type="button" key={item} onClick={() => toggleSubject(item)} className={profile.subjects.includes(item) ? 'rounded-full bg-primary/15 px-3 py-1.5 text-xs text-primary' : 'rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted-foreground'}>{item}</button>)}</div>

      <label className="mt-4 block text-xs font-semibold">Bio / परिचय</label>
      <textarea value={profile.bio || ''} onChange={(e) => setProfile((current) => current ? { ...current, bio: e.target.value.slice(0, 160) } : current)} placeholder="What are you preparing for? / आप किस परीक्षा की तैयारी कर रहे हैं?" className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background/60 p-3 text-sm" />

      <div className="mt-5 grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-muted-foreground sm:grid-cols-3">
        <span><Flame className="mr-1 inline h-4 w-4 text-orange-400" />{profile.streak || 0} day streak / दिन</span>
        <span><Users className="mr-1 inline h-4 w-4 text-primary" />{profile.followersCount || 0} followers / फॉलोअर्स</span>
        <span><Users className="mr-1 inline h-4 w-4 text-primary" />{followingCount} following / फॉलोइंग</span>
      </div>

      <Button className="mt-5" variant="gradient" onClick={() => void save()} disabled={saving}>
        <Save className="h-4 w-4" />{saving ? 'Saving… / सेव हो रहा है…' : 'Save profile / प्रोफ़ाइल सेव करें'}
      </Button>
    </GlassCard>
  </div>;
}
