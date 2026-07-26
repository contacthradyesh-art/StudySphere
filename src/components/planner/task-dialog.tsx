'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUBJECTS, type NewTask, type Priority, type Subject, type Task } from '@/lib/firestore/planner-schema';

interface TaskDialogProps {
  open: boolean;
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (data: NewTask) => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const todayIso = () => new Date().toISOString().slice(0, 10);

export function TaskDialog({ open, initial, onClose, onSubmit }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(todayIso());

  // AI states
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
      setAiTasks([]);
      setAiInput('');
      setShowAiPanel(false);
    }
  }, [open, initial]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), subject: (subject || null) as Subject | null, priority, dueDate });
  }

  async function handleAiGenerate() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiTasks([]);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiInput })
      });
      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        const mapped: NewTask[] = data.tasks.map((t: any) => ({
          title: t.title,
          subject: null,
          priority: (t.priority?.toLowerCase() as Priority) ?? 'medium',
          dueDate: t.dueDate ?? todayIso()
        }));
        setAiTasks(mapped);
      }
    } catch {
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
        {/* AI Panel Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? 'Edit task' : 'New task'}</h2>
          {!initial && (
            <Button
              type="button"
              variant={showAiPanel ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => setShowAiPanel(!showAiPanel)}
            >
              ✨ AI se banao
            </Button>
          )}
        </div>

        {/* AI Panel */}
        {showAiPanel && !initial && (
          <div className="space-y-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <p className="text-sm text-muted-foreground">Batao kya padhna hai — AI tasks bana dega!</p>
            <div className="flex gap-2">
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Kal Physics aur Maths padhna hai..."
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              />
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={handleAiGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? '...' : 'Go'}
              </Button>
            </div>

            {/* AI Generated Tasks */}
            {aiTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">AI ne banaye tasks:</p>
                  <Button type="button" size="sm" variant="gradient" onClick={addAllAiTasks}>
                    Sab Add Karo
                  </Button>
                </div>
                {aiTasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-background/40 p-2 text-sm">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.priority} • {task.dueDate}</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => addAiTask(task)}>
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual Form */}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Revise integration" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm"
              >
                <option value="">None</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={priority === p ? 'gradient' : 'outline'}
                  size="sm"
                  className="flex-1 capitalize"
                  onClick={() => setPriority(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient">{initial ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}