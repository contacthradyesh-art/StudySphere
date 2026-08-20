'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LifeMilestone } from '@/lib/firestore/lifegoal-schema';

interface MilestoneListProps {
  milestones: LifeMilestone[];
  onAdd: (title: string) => void;
  onToggle: (milestone: LifeMilestone) => void;
  onDelete: (milestone: LifeMilestone) => void;
}

export function MilestoneList({ milestones, onAdd, onToggle, onDelete }: MilestoneListProps) {
  const [title, setTitle] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
  }

  return (
    <div className="space-y-2">
      {milestones.length === 0 && (
        <p className="text-sm text-muted-foreground">Koi milestone nahi hai abhi tak. Pehla add karo.</p>
      )}
      {milestones.map((m) => (
        <div key={m.id} className="flex items-center gap-2 rounded-lg bg-background/40 p-2.5">
          <button onClick={() => onToggle(m)} className="shrink-0">
            {m.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <span className={m.status === 'completed' ? 'flex-1 text-sm line-through text-muted-foreground' : 'flex-1 text-sm'}>
            {m.title}
          </span>
          {m.deadline && <span className="text-xs text-muted-foreground">{m.deadline}</span>}
          <button onClick={() => onDelete(m)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <form onSubmit={submit} className="flex gap-2 pt-1">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naya milestone..." />
        <Button type="submit" size="sm" variant="outline"><Plus className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
