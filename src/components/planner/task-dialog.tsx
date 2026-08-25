'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { SUBJECTS, type NewTask, type Priority, type Subject, type Task } from '@/lib/firestore/planner-schema';

interface TaskDialogProps {
  open: boolean;
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (data: NewTask) => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const todayIso = () => new Date().toISOString().slice(0, 10);

function reminderFor(date: string, time: string, minutesBefore: number) {
  if (!time) return null;
  const value = new Date(`${date}T${time}:00`).getTime() - minutesBefore * 60_000;
  return Number.isFinite(value) ? value : null;
}

export function TaskDialog({ open, initial, onClose, onSubmit }: TaskDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(todayIso());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderBefore, setReminderBefore] = useState('10');

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTasks, setAiTasks] = useState<NewTask[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setSubject(initial?.subject ?? '');
      setPriority(initial?.priority ?? 'medium');
      setDueDate(initial?.dueDate ?? todayIso());
      setStartTime(initial?.startTime ?? '');
      setEndTime(initial?.endTime ?? '');
      setReminderEnabled(Boolean(initial?.reminderAt));
      setReminderBefore('10');
      setAiTasks([]);
      setAiInput('');
      setShowAiPanel(false);
    }
  }, [open, initial]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (startTime && endTime && endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }
    if (reminderEnabled && !startTime) {
      alert('Reminder ke liye pehle start time set karo');
      return;
    }

    onSubmit({
      title: title.trim(),
      subject: (subject || null) as Subject | null,
      priority,
      dueDate,
      startTime: startTime || null,
      endTime: endTime || null,
      reminderAt: reminderEnabled ? reminderFor(dueDate, startTime, Number(reminderBefore)) : null,
    });
  }

  async function handleAiGenerate() {
    if (!aiInput.trim() || !user) return;
    setAiLoading(true);
    setAiTasks([]);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message: aiInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI unavailable');
      if (Array.isArray(data.tasks)) {
        const mapped: NewTask[] = data.tasks.map((t: any) => ({
          title: String(t.title || 'Study task'),
          subject: null,
          priority: ((t.priority || 'Medium').toLowerCase() as Priority),
          dueDate: t.dueDate || todayIso()
        }));
        setAiTasks(mapped);
      }
    } catch (error) {
      console.error('Planner AI request failed:', error);
      alert('AI se connect nahi ho pa raha, baad mein try karo');
    } finally {
      setAiLoading(false);
    }
  }

  function addAiTask(task: NewTask) {
    onSubmit(task);
  }

  function addAllAiTasks() {
    aiTasks.forEach(t => onSubmit(t));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{initial ? 'Edit task' : 'New task'}</h2>
            <p className="text-xs text-muted-foreground">Turn a task into a real time block.</p>
          </div>
          {!initial && (
            <Button type="button" variant={showAiPanel ? 'gradient' : 'outline'} size="sm" onClick={() => setShowAiPanel(!showAiPanel)}>
              ✨ AI se banao
            </Button>
          )}
        </div>

        {showAiPanel && !initial && (
          <div className="space-y-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <p className="text-sm text-muted-foreground">Batao kya padhna hai — AI tasks bana dega!</p>
            <div className="flex gap-2">
              <Input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Kal Physics aur Maths padhna hai..." onKeyDown={(e) => { if (e.key === 'Enter') void handleAiGenerate(); }} />
              <Button type="button" variant="gradient" size="sm" onClick={() => void handleAiGenerate()} disabled={aiLoading || !user}>
                {aiLoading ? '...' : 'Go'}
              </Button>
            </div>

            {aiTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">AI ne banaye tasks:</p>
                  <Button type="button" size="sm" variant="gradient" onClick={addAllAiTasks}>Sab Add Karo</Button>
                </div>
                {aiTasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-background/40 p-2 text-sm">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.priority} • {task.dueDate}</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => addAiTask(task)}>+ Add</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Revise integration" autoFocus /></div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="subject">Subject</Label><select id="subject" value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm"><option value="">None</option>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="due">Due date</Label><Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="startTime">Start time</Label><Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="endTime">End time</Label><Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300">{reminderEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</span><div><p className="text-sm font-semibold">Smart reminder</p><p className="text-[10px] text-muted-foreground">Notify before this time block.</p></div></div>
              <button type="button" onClick={() => setReminderEnabled((value) => !value)} className={`relative h-6 w-11 rounded-full transition-colors ${reminderEnabled ? 'bg-violet-500' : 'bg-white/10'}`} aria-label="Toggle reminder"><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${reminderEnabled ? 'left-6' : 'left-1'}`} /></button>
            </div>
            {reminderEnabled && <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2"><select value={reminderBefore} onChange={(e) => setReminderBefore(e.target.value)} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="0">At start time</option><option value="5">5 minutes before</option><option value="10">10 minutes before</option><option value="15">15 minutes before</option><option value="30">30 minutes before</option></select><span className="text-[10px] text-muted-foreground">Browser alert</span></div>}
          </div>

          <div className="space-y-2"><Label>Priority</Label><div className="flex gap-2">{PRIORITIES.map((p) => <Button key={p} type="button" variant={priority === p ? 'gradient' : 'outline'} size="sm" className="flex-1 capitalize" onClick={() => setPriority(p)}>{priority === p && '✓ '}{p}</Button>)}</div></div>

          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="gradient">{initial ? 'Save' : 'Create'}</Button></div>
        </form>
      </div>
    </div>
  );
}
