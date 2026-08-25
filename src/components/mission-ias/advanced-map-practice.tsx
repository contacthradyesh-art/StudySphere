'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { toast } from 'sonner';
import {
  Award,
  Brain,
  Check,
  Compass,
  Crosshair,
  Flame,
  Globe2,
  Landmark,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { AskAiButton } from '@/components/ai/ask-ai-button';
import { useAuth } from '@/hooks/use-auth';
import { INDIA_STATES } from '@/lib/mission-ias/map-schema';
import {
  getMapProgress,
  recordMapAttempt,
  summarizeMapProgress,
  type StateProgress,
} from '@/lib/repositories/mapProgressRepository';
import { awardXp } from '@/lib/gamification/xp-service';
import { cn } from '@/lib/utils';

type MapFeature = Feature<Geometry, { name: string }>;
type Region = 'india' | 'world';
type Mode = 'explore' | 'smart' | 'timed';
type Difficulty = 'foundation' | 'upsc' | 'elite';

const WIDTH = 520;
const HEIGHT = 600;

const PALETTE = [
  '#7c3aed',
  '#8b5cf6',
  '#a855f7',
  '#9333ea',
  '#c026d3',
  '#d946ef',
  '#6366f1',
  '#4f46e5',
];

const DIFFICULTY: Record<
  Difficulty,
  { label: string; desc: string; seconds: number; points: number }
> = {
  foundation: {
    label: 'Foundation',
    desc: 'Learn the map with generous time.',
    seconds: 12,
    points: 5,
  },
  upsc: {
    label: 'UPSC',
    desc: 'Balanced Prelims-style practice.',
    seconds: 8,
    points: 10,
  },
  elite: {
    label: 'Elite',
    desc: 'Fast recall + weak-area targeting.',
    seconds: 5,
    points: 20,
  },
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function featureName(feature: MapFeature): string {
  return feature.properties?.name ?? 'Unknown';
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function accuracy(progress?: StateProgress): number {
  if (!progress) return 0;
  const attempts = progress.correctCount + progress.incorrectCount;
  return attempts > 0 ? Math.round((progress.correctCount / attempts) * 100) : 0;
}

export function AdvancedMapPractice() {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region>('india');
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('explore');
  const [difficulty, setDifficulty] = useState<Difficulty>('upsc');
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState<StateProgress[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongGuess, setWrongGuess] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showMastery, setShowMastery] = useState(false);
  const [lastState, setLastState] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);

  const india = region === 'india';
  const regionUrl = india
    ? '/data/india-states.geojson'
    : '/data/world-countries.geojson';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelected(null);
    setTarget(null);
    setQueue([]);
    setRoundComplete(false);
    setFeedback(null);

    fetch(regionUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Map data request failed');
        return response.json();
      })
      .then((data: FeatureCollection<Geometry, { name: string }>) => {
        if (!cancelled) setFeatures(data.features as MapFeature[]);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load map data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [regionUrl]);

  useEffect(() => {
    if (!user || !india) return;
    getMapProgress()
      .then(setProgress)
      .catch(() => undefined);
    try {
      setLastState(localStorage.getItem('ss_map_last_explored'));
    } catch {
      // Ignore local storage failures.
    }
  }, [user, india]);

  const stats = useMemo(
    () => summarizeMapProgress(progress),
    [progress],
  );

  const progressByName = useMemo(
    () => new Map(progress.map((item) => [normalize(item.stateName), item])),
    [progress],
  );

  const weakStates = useMemo(() => {
    if (!india) return [];

    return features
      .map(featureName)
      .sort((a, b) => {
        const aProgress = progressByName.get(normalize(a));
        const bProgress = progressByName.get(normalize(b));
        const aAttempts = aProgress
          ? aProgress.correctCount + aProgress.incorrectCount
          : 0;
        const bAttempts = bProgress
          ? bProgress.correctCount + bProgress.incorrectCount
          : 0;
        const aScore = aProgress ? accuracy(aProgress) : -20;
        const bScore = bProgress ? accuracy(bProgress) : -20;
        return aScore - aAttempts * 0.25 - (bScore - bAttempts * 0.25);
      })
      .slice(0, 8);
  }, [features, progressByName, india]);

  const masteredCount = useMemo(
    () =>
      progress.filter(
        (item) => item.correctCount >= 3 && accuracy(item) >= 70,
      ).length,
    [progress],
  );

  const masteryPct =
    india && features.length > 0
      ? Math.round((masteredCount / features.length) * 100)
      : 0;

  const projection = useMemo(() => {
    if (!features.length) return null;
    const collection: FeatureCollection<Geometry, { name: string }> = {
      type: 'FeatureCollection',
      features,
    };
    return geoMercator().fitSize([WIDTH, HEIGHT], collection);
  }, [features]);

  const pathGen = useMemo(
    () => (projection ? geoPath(projection) : null),
    [projection],
  );

  const startSmart = useCallback(() => {
    if (!features.length) return;
    const names = features.map(featureName);
    const focus = india ? weakStates : names;
    const weighted = shuffle([...focus, ...focus, ...names]);
    const first = weighted[0];

    setMode('smart');
    setScore(0);
    setAttempted(0);
    setSessionStreak(0);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
    setQueue(weighted.slice(1));
    setTarget(first ?? null);
    setSecondsLeft(DIFFICULTY[difficulty].seconds);
  }, [features, weakStates, india, difficulty]);

  const startTimed = useCallback(() => {
    if (!features.length) return;
    const names = shuffle(features.map(featureName));
    const first = names[0];

    setMode('timed');
    setScore(0);
    setAttempted(0);
    setSessionStreak(0);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
    setQueue(names.slice(1));
    setTarget(first ?? null);
    setSecondsLeft(60);
  }, [features]);

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setWrongGuess(null);

    if (queue.length === 0) {
      if (mode === 'timed' && features.length > 0) {
        const names = shuffle(features.map(featureName));
        setQueue(names.slice(1));
        setTarget(names[0] ?? null);
        return;
      }

      setTarget(null);
      setRoundComplete(true);
      setSecondsLeft(null);
      toast.success('Advanced round complete!');
      return;
    }

    setTarget(queue[0]);
    setQueue((current) => current.slice(1));
    if (mode === 'smart') {
      setSecondsLeft(DIFFICULTY[difficulty].seconds);
    }
  }, [queue, mode, features, difficulty]);

  useEffect(() => {
    if (mode !== 'smart' || secondsLeft === null || !target || feedback) {
      return;
    }

    if (secondsLeft <= 0) {
      setAttempted((value) => value + 1);
      setSessionStreak(0);
      setFeedback('wrong');
      setWrongGuess(null);
      if (india && user) {
        void recordMapAttempt(target, false)
          .then(() => getMapProgress())
          .then(setProgress)
          .catch(() => undefined);
      }
      const timer = window.setTimeout(nextQuestion, 550);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((value) => (value === null ? null : value - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [mode, secondsLeft, target, feedback, india, user, nextQuestion]);

  useEffect(() => {
    if (mode !== 'timed' || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      setTarget(null);
      setRoundComplete(true);
      return;
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((value) => (value === null ? null : value - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [mode, secondsLeft]);

  const choose = useCallback(
    (name: string) => {
      if (mode === 'explore') {
        setSelected(name);
        setLastState(name);
        if (india) {
          try {
            localStorage.setItem('ss_map_last_explored', name);
          } catch {
            // Ignore local storage failures.
          }
        }
        return;
      }

      if (!target || feedback || (mode === 'timed' && (secondsLeft ?? 0) <= 0)) {
        return;
      }

      const correct = normalize(name) === normalize(target);
      setAttempted((value) => value + 1);

      if (correct) {
        setScore((value) =>
          value + (mode === 'smart' ? DIFFICULTY[difficulty].points : 1),
        );
        setSessionStreak((value) => value + 1);
        setFeedback('correct');

        if (india && user) {
          void recordMapAttempt(target, true)
            .then(() => getMapProgress())
            .then(setProgress)
            .catch(() => undefined);
          void awardXp(user.uid, 'mapPracticeCorrect');
        }

        const timer = window.setTimeout(
          nextQuestion,
          mode === 'timed' ? 220 : 650,
        );
        window.setTimeout(() => undefined, 0);
        return () => window.clearTimeout(timer);
      }

      setFeedback('wrong');
      setWrongGuess(name);
      setSessionStreak(0);

      if (india && user) {
        void recordMapAttempt(target, false)
          .then(() => getMapProgress())
          .then(setProgress)
          .catch(() => undefined);
      }

      if (mode === 'timed') {
        window.setTimeout(nextQuestion, 350);
      }
    },
    [
      mode,
      target,
      feedback,
      secondsLeft,
      difficulty,
      india,
      user,
      nextQuestion,
    ],
  );

  const searchMatch = useMemo(() => {
    const query = normalize(search);
    if (!query || mode !== 'explore') return null;
    return (
      features.find((feature) =>
        normalize(featureName(feature)).includes(query),
      ) ?? null
    );
  }, [search, mode, features]);

  useEffect(() => {
    if (searchMatch) setSelected(featureName(searchMatch));
  }, [searchMatch]);

  const selectedInfo = useMemo(() => {
    if (!selected || !india) return null;
    return (
      INDIA_STATES.find(
        (state) => normalize(state.name) === normalize(selected),
      ) ?? null
    );
  }, [selected, india]);

  const selectedProgress = selected
    ? progressByName.get(normalize(selected))
    : undefined;

  const setExplore = useCallback(() => {
    setMode('explore');
    setTarget(null);
    setSecondsLeft(null);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-primary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" />
              Advanced Geography Lab
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <MapIcon className="h-7 w-7 text-primary" />
              Map Practice
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Adaptive map training for UPSC Prelims: explore, diagnose weak areas, build recall speed, and master the map.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRegion('india')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all',
                region === 'india'
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground',
              )}
            >
              <Landmark className="h-4 w-4" /> India
            </button>
            <button
              type="button"
              onClick={() => setRegion('world')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all',
                region === 'world'
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground',
              )}
            >
              <Globe2 className="h-4 w-4" /> World
            </button>
          </div>
        </div>
      </section>

      {india && user && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-4 w-4 text-primary" /> Accuracy
            </div>
            <p className="mt-1 text-xl font-bold">{stats.accuracyPct}%</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Mastery
            </div>
            <p className="mt-1 text-xl font-bold">{masteryPct}%</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Award className="h-4 w-4 text-primary" /> States
            </div>
            <p className="mt-1 text-xl font-bold">{masteredCount}/{features.length}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" /> Weak Areas
            </div>
            <p className="mt-1 text-xl font-bold">{weakStates.length}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" /> Streak
            </div>
            <p className="mt-1 text-xl font-bold">{sessionStreak}</p>
          </GlassCard>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={setExplore}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              mode === 'explore'
                ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <Compass className="h-4 w-4" /> Explore
          </button>
          <button
            type="button"
            onClick={startSmart}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              mode === 'smart'
                ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <Brain className="h-4 w-4" /> Smart Practice
          </button>
          <button
            type="button"
            onClick={startTimed}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              mode === 'timed'
                ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <Timer className="h-4 w-4" /> 60s Sprint
          </button>
        </div>

        {mode !== 'explore' && (
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setDifficulty(item)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold',
                  difficulty === item
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {DIFFICULTY[item].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {india && mode === 'smart' && (
        <GlassCard className="border-primary/20 bg-primary/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Adaptive mission
              </p>
              <p className="mt-1 text-sm">
                Questions target your weakest states.{' '}
                {target ? (
                  <>
                    Locate <strong className="text-primary">{target}</strong> on the map.
                  </>
                ) : (
                  'Round complete.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span>
                <Trophy className="mr-1 inline h-4 w-4 text-amber-400" />
                {score} pts
              </span>
              <span>
                <Flame className="mr-1 inline h-4 w-4 text-orange-400" />
                {sessionStreak}
              </span>
              {secondsLeft !== null && <span>{secondsLeft}s</span>}
            </div>
          </div>
        </GlassCard>
      )}

      {mode === 'timed' && (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {target ? (
                <>Find <span className="text-primary">{target}</span></>
              ) : (
                'Sprint finished'
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Fast recall. Every correct answer keeps your score moving.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="rounded-lg bg-white/5 px-3 py-1.5">
              {secondsLeft ?? 0}s
            </span>
            <span>
              <Trophy className="mr-1 inline h-4 w-4 text-amber-400" />
              {score}
            </span>
            <Button size="sm" variant="outline" onClick={startTimed}>
              <RotateCcw className="h-4 w-4" /> Restart
            </Button>
          </div>
        </GlassCard>
      )}

      {feedback && mode !== 'explore' && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold',
            feedback === 'correct'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300',
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            {feedback === 'correct' ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </span>
          {feedback === 'correct'
            ? `Correct! +${mode === 'smart' ? DIFFICULTY[difficulty].points : 1} points.`
            : `Not quite${wrongGuess ? ` — you clicked ${wrongGuess}` : ''}. The answer is ${target}.`}
        </div>
      )}

      {mode === 'explore' && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${india ? 'states and union territories' : 'countries'}...`}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.7fr)]">
        <GlassCard className="relative overflow-hidden p-2 sm:p-4">
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1 rounded-xl border border-white/10 bg-secondary/85 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(4, value + 0.5))}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Reset zoom"
            >
              <Crosshair className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">
              Loading geography lab...
            </div>
          ) : pathGen ? (
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="mx-auto h-auto max-h-[650px] w-full max-w-[560px]"
            >
              <g
                transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}
              >
                <defs>
                  <filter id="mapGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {features.map((feature, index) => {
                  const name = featureName(feature);
                  const itemProgress = progressByName.get(normalize(name));
                  const isSelected = mode === 'explore' && selected === name;
                  const isTarget = mode !== 'explore' && target === name;
                  const isWrong = wrongGuess === name;

                  return (
                    <path
                      key={`${name}-${index}`}
                      d={pathGen(feature) ?? ''}
                      onClick={() => choose(name)}
                      fill={
                        isWrong
                          ? '#ef4444'
                          : feedback === 'correct' && isTarget
                            ? '#22c55e'
                            : PALETTE[index % PALETTE.length]
                      }
                      fillOpacity={
                        isSelected ? 0.95 : mode !== 'explore' ? 0.6 : 0.68
                      }
                      stroke={isSelected || isTarget ? 'white' : 'rgba(255,255,255,.22)'}
                      strokeWidth={isSelected || isTarget ? 1.8 : 0.55}
                      filter={
                        isSelected || isTarget || isWrong
                          ? 'url(#mapGlow)'
                          : undefined
                      }
                      className="cursor-pointer transition-all duration-200 hover:brightness-125"
                      aria-label={`${name}${itemProgress ? `, ${accuracy(itemProgress)} percent accuracy` : ''}`}
                    >
                      <title>
                        {name}
                        {itemProgress ? ` • ${accuracy(itemProgress)}% accuracy` : ''}
                      </title>
                    </path>
                  );
                })}
              </g>
            </svg>
          ) : null}
        </GlassCard>

        <div className="space-y-3">
          {mode === 'explore' && selected ? (
            <GlassCard className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">
                    Selected region
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{selected}</h2>
                </div>
                {selectedProgress && (
                  <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{accuracy(selectedProgress)}%</p>
                    <p className="text-[10px] text-muted-foreground">accuracy</p>
                  </div>
                )}
              </div>

              {selectedInfo && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="mt-1 font-medium">
                        {selectedInfo.type === 'state' ? 'State' : 'Union Territory'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-xs text-muted-foreground">Capital</p>
                      <p className="mt-1 font-medium">{selectedInfo.capital}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Borders</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedInfo.neighbors.map((neighbor) => (
                        <span
                          key={neighbor}
                          className="rounded-full border border-white/10 px-2 py-1 text-[11px]"
                        >
                          {neighbor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <AskAiButton
                    label="UPSC facts & map traps"
                    prompt={`Give me high-yield UPSC Prelims facts about ${selectedInfo.name}: capital, neighbouring states/countries, rivers, physical geography, national parks, borders, and common map-based traps.`}
                  />
                </>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="font-bold">Adaptive Intelligence</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Your practice focuses on weak recall instead of repeatedly asking what you already know.
              </p>
              {india && user && weakStates.length > 0 && (
                <div className="space-y-2">
                  {weakStates.slice(0, 5).map((name, index) => {
                    const itemProgress = progressByName.get(normalize(name));
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => {
                          setExplore();
                          setSelected(name);
                        }}
                        className="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left hover:bg-white/10"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          {name}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {itemProgress ? `${accuracy(itemProgress)}%` : 'New'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <Button className="w-full bg-gradient-brand" onClick={startSmart}>
                <Brain className="h-4 w-4" /> Start Smart Practice
              </Button>
            </GlassCard>
          )}

          {india && user && (
            <GlassCard>
              <button
                type="button"
                onClick={() => setShowMastery((value) => !value)}
                className="flex w-full items-center justify-between"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Mastery Matrix
                </span>
                <span className="text-xs text-muted-foreground">
                  {showMastery ? 'Hide' : 'View'}
                </span>
              </button>

              {showMastery && (
                <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-auto">
                  {features.map((feature) => {
                    const name = featureName(feature);
                    const itemProgress = progressByName.get(normalize(name));
                    const itemAccuracy = accuracy(itemProgress);
                    const mastered =
                      !!itemProgress &&
                      itemProgress.correctCount >= 3 &&
                      itemAccuracy >= 70;

                    return (
                      <div key={name} className="rounded-lg bg-white/5 p-2">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="truncate">{name}</span>
                          <span
                            className={cn(
                              'font-bold',
                              mastered
                                ? 'text-emerald-400'
                                : itemAccuracy >= 50
                                  ? 'text-amber-400'
                                  : 'text-red-400',
                            )}
                          >
                            {itemProgress ? `${itemAccuracy}%` : '—'}
                          </span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-brand"
                            style={{ width: `${Math.min(100, itemAccuracy)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          )}

          {lastState && (
            <GlassCard className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Continue learning</p>
                <p className="font-semibold">{lastState}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExplore();
                  setSelected(lastState);
                }}
                className="rounded-lg bg-primary/10 p-2 text-primary"
                aria-label="Continue learning"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </GlassCard>
          )}
        </div>
      </div>

      {roundComplete && mode !== 'explore' && (
        <GlassCard className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">Session complete</h2>
          <p className="text-sm text-muted-foreground">
            {score} points • {attempted ? Math.round((score / attempted) * 100) : 0}% session performance • {sessionStreak} current streak
          </p>
          <Button
            onClick={mode === 'smart' ? startSmart : startTimed}
            className="bg-gradient-brand"
          >
            <Zap className="h-4 w-4" /> Go again
          </Button>
        </GlassCard>
      )}
    </div>
  );
}
