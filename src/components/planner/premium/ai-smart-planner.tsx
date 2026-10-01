'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Wand2 } from 'lucide-react';
import { GlowCard, SectionHeading } from './glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { authedFetch } from '@/lib/auth/authed-fetch';
import { toDateKey } from '@/lib/planner/date-keys';
import { generateWeeklyPlan } from '@/lib/planner/ai-generator';
import { saveWeeklyPlan } from '@/lib/planner/weekly-plan-service';
import { SUBJECTS, type Subject, type WeeklySlot } from '@/lib/firestore/planner-schema';

const DAYS = ['Mon / सोम', 'Tue / मंगल', 'Wed / बुध', 'Thu / गुरु', 'Fri / शुक्र', 'Sat / शनि', 'Sun / रवि'];

export function AiSmartPlanner({ weeklySlots }: { weeklySlots: WeeklySlot[] }) {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [examDate, setExamDate] = useState('');
  const [picked, setPicked] = useState<Subject[]>(['Mathematics', 'Physics']);
  const [weakPicked, setWeakPicked] = useState<Subject[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(14);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<WeeklySlot[] | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState(false);

  function togglePicked(subject: Subject) {
    setPicked((prev) => (prev.includes(subject) ? prev.filter((x) => x !== subject) : [...prev, subject]));
  }

  function toggleWeak(subject: Subject) {
    setWeakPicked((prev) => (prev.includes(subject) ? prev.filter((x) => x !== subject) : [...prev, subject]));
  }

  async function handleGenerate() {
    if (!requireAuth(user)) return;
    setGenerating(true);
    setFallbackNotice(false);

    const localFallback = () => {
      const result = generateWeeklyPlan({ subjects: picked, weeklyHours, weakSubjects: weakPicked });
      setPreview(result);
      setFallbackNotice(true);
    };

    try {
      const response = await authedFetch('/api/ai/planner/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: picked,
          weeklyHours,
          weakSubjects: weakPicked,
          examDates: examDate ? [examDate] : [],
          todayKey: toDateKey(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI planner failed');
      setPreview(data.slots as WeeklySlot[]);
      toast.success('AI weekly roadmap generated / AI साप्ताहिक रोडमैप तैयार');
    } catch {
      localFallback();
      toast.info('AI unavailable, so the local planner was used / AI उपलब्ध नहीं था, इसलिए लोकल प्लानर इस्तेमाल हुआ।');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!preview || !requireAuth(user)) return;
    setGenerating(true);
    try {
      await saveWeeklyPlan(user.uid, preview);
      toast.success('Weekly roadmap saved / साप्ताहिक रोडमैप सेव हो गया');
    } catch {
      toast.error('Could not save the generated plan / प्लान सेव नहीं हो सका');
    } finally {
      setGenerating(false);
    }
  }

  const roadmap = preview ?? weeklySlots;

  return (
    <GlowCard delay={0.1} accent="#8b5cf6" className="space-y-5">
      <SectionHeading eyebrow="AI Smart Planner / AI स्मार्ट प्लानर" title="Build your weekly roadmap / साप्ताहिक रोडमैप बनाएं" action={<Wand2 className="h-5 w-5 text-primary" />} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="goal">Goal / exam · लक्ष्य / परीक्षा</Label>
          <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. SSC CHSL, UPP Constable" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exam-date">Exam date / परीक्षा तिथि</Label>
          <Input id="exam-date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">Subjects to include / शामिल विषय</p>
        <div className="flex flex-wrap gap-2">{SUBJECTS.map((subject) => <button type="button" key={subject} onClick={() => togglePicked(subject)} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', picked.includes(subject) ? 'border-primary bg-primary/15 text-primary' : 'border-input text-muted-foreground')}>{subject}</button>)}</div>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">Weak subjects / कमजोर विषय</p>
        <div className="flex flex-wrap gap-2">{picked.map((subject) => <button type="button" key={subject} onClick={() => toggleWeak(subject)} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', weakPicked.includes(subject) ? 'border-rose-400 bg-rose-400/15 text-rose-300' : 'border-input text-muted-foreground')}>{subject}</button>)}</div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Available hours / week · उपलब्ध घंटे</label>
        <input type="range" min={4} max={40} value={weeklyHours} onChange={(e) => setWeeklyHours(Number(e.target.value))} className="flex-1 accent-primary" />
        <span className="w-12 text-right text-sm font-semibold">{weeklyHours}h</span>
      </div>

      {fallbackNotice && <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">AI fallback active / AI fallback सक्रिय है — local planner result shown / लोकल प्लान दिखाया गया है।</p>}

      <div className="flex flex-wrap gap-2">
        <Button variant="gradient" onClick={() => void handleGenerate()} disabled={picked.length === 0 || generating}><Sparkles className="h-4 w-4" />{generating ? 'Generating… / बन रहा है…' : 'Generate roadmap / रोडमैप बनाएं'}</Button>
        {preview && <Button variant="outline" onClick={() => void handleSave()} disabled={generating || !user}>{generating ? 'Saving…' : 'Save weekly plan / साप्ताहिक प्लान सेव करें'}</Button>}
      </div>

      {roadmap.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DAYS.map((day, dayIdx) => {
          const daySlots = roadmap.filter((slot) => slot.day === dayIdx);
          return <motion.div key={day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dayIdx * 0.04 }} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{day}</p>
            {daySlots.length === 0 ? <p className="text-xs text-muted-foreground">Rest / आराम</p> : <div className="space-y-1.5">{daySlots.map((slot, i) => <div key={`${slot.subject}-${slot.day}-${i}`} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-xs"><Sparkles className="h-3 w-3 shrink-0 text-primary" /><span className="truncate font-medium">{slot.subject}</span><span className="ml-auto shrink-0 opacity-70">{slot.hours}h{slot.isRevision ? ' rev' : ''}</span></div>)}</div>}
          </motion.div>;
        })}
      </div>}
    </GlowCard>
  );
}
