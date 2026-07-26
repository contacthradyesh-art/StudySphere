'use client';

import { formatDuration } from '@/lib/utils';
import type { PomodoroPhase } from '@/lib/firestore/pomodoro-schema';

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  focus: 'Focus', shortBreak: 'Short break', longBreak: 'Long break'
};

/** Circular SVG progress ring showing remaining time. */
export function TimerRing({ remaining, progress, phase }: { remaining: number; progress: number; phase: PomodoroPhase }) {
  const size = 280;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#grad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-5xl font-bold tabular-nums">
          {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{PHASE_LABEL[phase]}</p>
      </div>
    </div>
  );
}
