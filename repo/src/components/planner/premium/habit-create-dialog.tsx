'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NewHabit, HabitFrequency } from '@/lib/firestore/habit-schema';

interface HabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewHabit) => void;
}

const ACCENTS = ['#8b5cf6', '#ec4899', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];
const ICONS = ['BookOpen', 'Droplet', 'Dumbbell', 'Moon', 'Brain', 'Sparkles'];
const FREQUENCIES: { id: HabitFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' }
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitDialog({ open, onClose, onSubmit }: HabitDialogProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(ACCENTS[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [timesPerPeriod, setTimesPerPeriod] = useState(3);
  const [customMode, setCustomMode] = useState<'weekdays' | 'count'>('weekdays');

  useEffect(() => {
    if (open) {
      setTitle('');
      setIcon(ICONS[0]);
      setColor(ACCENTS[0]);
      setFrequency('daily');
      setCustomDays([]);
      setTimesPerPeriod(3);
      setCustomMode('weekdays');
    }
  }, [open]);

  if (!open) return null;

  function toggleDay(d: number) {
    setCustomDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      icon,
      color,
      frequency,
      customDays: frequency === 'custom' && customMode === 'weekdays' && customDays.length > 0 ? customDays : null,
      timesPerPeriod: frequency === 'custom' && customMode === 'count' ? timesPerPeriod : null
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">New habit</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-title">Title</Label>
            <Input id="habit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Drink water" autoFocus />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  size="sm"
                  variant={frequency === f.id ? 'gradient' : 'outline'}
                  className="flex-1"
                  onClick={() => setFrequency(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {frequency === 'custom' && (
            <div className="space-y-3 rounded-xl border border-input p-3">
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={() => setCustomMode('weekdays')} className={customMode === 'weekdays' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                  Specific days
                </button>
                <span className="text-muted-foreground">·</span>
                <button type="button" onClick={() => setCustomMode('count')} className={customMode === 'count' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                  X times / week
                </button>
              </div>

              {customMode === 'weekdays' ? (
                <div className="flex gap-1.5">
                  {WEEKDAYS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`h-8 w-8 rounded-full text-xs font-medium ${customDays.includes(i) ? 'bg-gradient-brand text-white' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} max={7} value={timesPerPeriod} onChange={(e) => setTimesPerPeriod(Number(e.target.value))} className="w-20" />
                  <span className="text-sm text-muted-foreground">times per week, any day</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs ${icon === i ? 'border-primary bg-primary/15 text-primary' : 'border-input text-muted-foreground'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accent color</Label>
            <div className="flex gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform"
                  style={{ background: c, borderColor: color === c ? '#fff' : 'transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient">Create habit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
