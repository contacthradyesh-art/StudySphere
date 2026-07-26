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
import { generateWeeklyPlan } from '@/lib/planner/ai-generator';
import { saveWeeklyPlan } from '@/lib/planner/weekly-plan-service';
import { SUBJECTS, type Subject, type WeeklySlot } from '@/lib/firestore/planner-schema';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AiSmartPlanner({ weeklySlots }: { weeklySlots: WeeklySlot[] }) {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [picked, setPicked] = useState<Subject[]>(['Mathematics', 'Physics']);
  const [weakPicked, setWeakPicked] = useState<Subject[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(14);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<WeeklySlot[] | null>(null);

  function togglePicked(s: Subject) {
    setPicked((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function toggleWeak(s: Subject) {
    setWeakPicked((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function handleGenerate() {
    const result = generateWeeklyPlan({ subjects: picked, weeklyHours, weakSubjects: weakPicked });
    setPreview(result);
  }

  async function handleSave() {
    if (!user || !preview) return;
    setGenerating(true);
    try {
      await saveWeeklyPlan(user.uid, preview);
      toast.success('Weekly roadmap saved');
    } catch {
      toast.error('Could not save the generated plan');
    } finally {
      setGenerating(false);
    }
  }

  const roadmap = preview ?? weeklySlots;

  return (
    <GlowCard delay={0.1} accent="#8b5cf6" className="space-y-5">
      <SectionHeading eyebrow="AI Smart Planner" title="Build your weekly roadmap" action={<Wand2 className="h-5 w-5 text-primary" />} />

      <div className="space-y-1.5">
        <Label htmlFor="goal">Goal / exam</Label>
        <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. SSC CHSL, UPP Constable, JEE Mains" />
      </div>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">Subjects to include</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => togglePicked(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                picked.includes(s) ? 'border-primary bg-primary/15 text-primary' : 'border-input text-muted-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">Weak subjects (get extra weighting)</p>
        <div className="flex flex-wrap gap-2">
          {picked.map((s) => (
            <button
              key={s}
              onClick={() => toggleWeak(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                weakPicked.includes(s) ? 'border-rose-400 bg-rose-400/15 text-rose-300' : 'border-input text-muted-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Available hours / week</label>
        <input
          type="range" min={4} max={40} value={weeklyHours}
          onChange={(e) => setWeeklyHours(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="w-12 text-right text-sm font-semibold">{weeklyHours}h</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="gradient" onClick={handleGenerate} disabled={picked.length === 0}>
          <Sparkles className="h-4 w-4" /> Generate roadmap
        </Button>
        {preview && (
          <Button variant="outline" onClick={handleSave} disabled={generating || !user}>
            {generating ? 'Saving...' : 'Save as my weekly plan'}
          </Button>
        )}
      </div>

      {roadmap.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map((day, dayIdx) => {
            const daySlots = roadmap.filter((s) => s.day === dayIdx);
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIdx * 0.04 }}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{day}</p>
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Rest</p>
                ) : (
                  <div className="space-y-1.5">
                    {daySlots.map((s, i) => {
  const meta = {
    glow: '#8b5cf6',
    icon: Sparkles
  };

  
                    
                      return (
                        <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-xs">
                          <meta.icon className="h-3 w-3 shrink-0" style={{ color: meta.glow }} />
                          <span className="truncate font-medium">{s.subject}</span>
                          <span className="ml-auto shrink-0 opacity-70">{s.hours}h{s.isRevision ? ' rev' : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </GlowCard>
  );
}
