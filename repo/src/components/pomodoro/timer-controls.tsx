'use client';

import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PomodoroPhase } from '@/lib/firestore/pomodoro-schema';

interface TimerControlsProps {
  running: boolean;
  phase: PomodoroPhase;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitch: (p: PomodoroPhase) => void;
}

const PHASES: { id: PomodoroPhase; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'shortBreak', label: 'Short' },
  { id: 'longBreak', label: 'Long' }
];

/** Play/pause/reset/skip controls plus phase switcher. */
export function TimerControls({ running, phase, onStart, onPause, onReset, onSwitch }: TimerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1 rounded-xl bg-secondary p-1">
        {PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => onSwitch(p.id)}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              phase === p.id ? 'bg-gradient-brand text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Reset" onClick={onReset}><RotateCcw className="h-5 w-5" /></Button>
        {running ? (
          <Button variant="gradient" size="lg" onClick={onPause}><Pause className="h-5 w-5" /> Pause</Button>
        ) : (
          <Button variant="gradient" size="lg" onClick={onStart}><Play className="h-5 w-5" /> Start</Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Skip" onClick={() => onSwitch(phase === 'focus' ? 'shortBreak' : 'focus')}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
