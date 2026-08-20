'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Maximize2, Minimize2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { TimerRing } from '@/components/pomodoro/timer-ring';
import { TimerControls } from '@/components/pomodoro/timer-controls';
import { SessionStats } from '@/components/pomodoro/session-stats';
import { PomodoroHistoryChart } from '@/components/pomodoro/history-chart';
import { useAuth } from '@/hooks/use-auth';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { usePomodoroStore } from '@/store/pomodoro-store';
import { recordSession, subscribeSessions } from '@/lib/pomodoro/session-service';
import { summarizeSessions } from '@/lib/pomodoro/stats';
import { awardXp } from '@/lib/gamification/xp-service';
import { cn } from '@/lib/utils';
import type { PomodoroPhase } from '@/lib/firestore/pomodoro-schema';

// Audio files should be placed at these paths under /public.
const TRACKS = [
  { id: 'none', label: 'Off', src: null as string | null },
  { id: 'lofi', label: 'Lo-fi', src: '/audio/lofi.mp3' },
  { id: 'rain', label: 'Rain', src: '/audio/rain.mp3' },
  { id: 'forest', label: 'Forest', src: '/audio/forest.mp3' }
];

export default function PomodoroPage() {
  const { user } = useAuth();
  const { settings, sessions, setSessions, fullScreen, setFullScreen } = usePomodoroStore();
  const [track, setTrack] = useState('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const selected = TRACKS.find((t) => t.id === track);
    const audio = audioRef.current;
    if (!audio) return;

    if (!selected?.src) {
      audio.pause();
      audio.removeAttribute('src');
      return;
    }

    if (audio.src.endsWith(selected.src)) {
      audio.play().catch(() => {
        toast.error('Could not play audio. Check that the file exists in /public/audio.');
      });
      return;
    }

    audio.src = selected.src;
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {
      toast.error('Could not play audio. Check that the file exists in /public/audio.');
    });
  }, [track]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeSessions(user.uid, setSessions);
    return () => unsub();
  }, [user, setSessions]);

  const handleComplete = useCallback(
    (phase: PomodoroPhase, durationSeconds: number) => {
      if (user) {
        recordSession(user.uid, { phase, durationSeconds, completedSeconds: durationSeconds, subject: null, completed: true });
        if (phase === 'focus') void awardXp(user.uid, 'completePomodoro');
      }
      toast.success(phase === 'focus' ? 'Focus session complete! +15 XP' : 'Break over - back to it!');
    },
    [user]
  );

  const timer = usePomodoro({ settings, onComplete: handleComplete });
  const stats = summarizeSessions(sessions);

  const ring = (
    <div className="flex flex-col items-center gap-8">
      <TimerRing remaining={timer.remaining} progress={timer.progress} phase={timer.phase} />
      <TimerControls
        running={timer.running}
        phase={timer.phase}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={timer.reset}
        onSwitch={timer.switchTo}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background">
        <audio ref={audioRef} />
        <Button variant="ghost" size="icon" className="absolute right-6 top-6" aria-label="Exit full screen" onClick={() => setFullScreen(false)}>
          <Minimize2 className="h-5 w-5" />
        </Button>
        {ring}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <audio ref={audioRef} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pomodoro</h1>
          <p className="text-sm text-muted-foreground">Focus in cycles. Sessions are tracked automatically.</p>
        </div>
        <Button variant="outline" onClick={() => setFullScreen(true)}>
          <Maximize2 className="h-4 w-4" /> Full screen
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="grid place-items-center py-10 lg:col-span-2">{ring}</GlassCard>
        <div className="space-y-4">
          <GlassCard>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Music className="h-4 w-4" /> Focus music</h2>
            <div className="flex flex-wrap gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrack(t.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    track === t.id ? 'border-primary bg-primary/15 text-primary' : 'border-input text-muted-foreground'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Audio files ship in /public/audio; selection persists per session.</p>
          </GlassCard>
          <GlassCard>
            <h2 className="mb-1 font-semibold">Cycle</h2>
            <p className="text-sm text-muted-foreground">
              {settings.focusMinutes}m focus / {settings.shortBreakMinutes}m break, long break every {settings.cyclesBeforeLongBreak} cycles.
            </p>
            <p className="mt-2 text-sm">Completed focus sessions: <span className="font-semibold">{timer.completedFocusCount}</span></p>
          </GlassCard>
        </div>
      </div>

      <SessionStats stats={stats} />

      <PomodoroHistoryChart sessions={sessions} />

      <GlassCard>
        <h2 className="mb-3 font-semibold">Session history</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions yet. Start your first focus block!</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {sessions.slice(0, 10).map((s) => (
              <li key={s.id} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                <span className="capitalize">{s.phase.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-muted-foreground">{Math.round(s.completedSeconds / 60)}m</span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}