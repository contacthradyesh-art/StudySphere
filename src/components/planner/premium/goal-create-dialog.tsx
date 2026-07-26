'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NewLifeGoal, LifeGoal } from '@/lib/firestore/lifegoal-schema';

interface GoalDialogProps {
  open: boolean;
  initial?: LifeGoal | null;
  onClose: () => void;
  onSubmit: (data: NewLifeGoal) => void;
}

const ACCENTS = ['#8b5cf6', '#ec4899', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

export function GoalDialog({ open, initial, onClose, onSubmit }: GoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examTag, setExamTag] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(ACCENTS[0]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setExamTag(initial?.examTag ?? '');
      setDeadline(initial?.deadline ?? '');
      setColor(initial?.color ?? ACCENTS[0]);
    }
  }, [open, initial]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      examTag: examTag.trim() || null,
      deadline: deadline || null,
      color
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">{initial ? 'Edit goal' : 'New life goal'}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Title</Label>
            <Input id="goal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Crack SSC CHSL 2026" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-desc">Description (optional)</Label>
            <Input id="goal-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why this goal matters" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-tag">Exam / context tag</Label>
              <Input id="goal-tag" value={examTag} onChange={(e) => setExamTag(e.target.value)} placeholder="SSC CHSL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
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
            <Button type="submit" variant="gradient">{initial ? 'Save' : 'Create goal'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
