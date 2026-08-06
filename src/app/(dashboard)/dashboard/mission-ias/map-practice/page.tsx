'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import { Map, Target, Compass, RotateCcw, Trophy, Globe2, Landmark, Zap, Search } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INDIA_STATES } from '@/lib/mission-ias/map-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';

type MapFeature = Feature<Geometry, { name: string }>;
type Region = 'india' | 'world';

const WIDTH = 500;
const HEIGHT = 600;

const REGIONS: { id: Region; label: string; icon: typeof Landmark; dataUrl: string }[] = [
  { id: 'india', label: 'India', icon: Landmark, dataUrl: '/data/india-states.geojson' },
  { id: 'world', label: 'World', icon: Globe2, dataUrl: '/data/world-countries.geojson' }
];

// A curated palette (not the default Tailwind/D3 categorical set) so the
// map feels intentional rather than auto-generated. Colors are assigned
// deterministically by feature index, so a given state/country always gets
// the same color across sessions.
const PALETTE = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f97316', '#eab308',
  '#a855f7', '#14b8a6', '#f43f5e', '#3b82f6', '#84cc16', '#fb923c'
];

function colorForIndex(i: number): string {
  return PALETTE[i % PALETTE.length];
}

function getFeatureName(props: { name?: string } | undefined | null): string {
  return props?.name ?? 'Unknown';
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MapPracticePage() {
  const [region, setRegion] = useState<Region>('india');
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'explore' | 'identify' | 'timed'>('explore');
  const [selected, setSelected] = useState<string | null>(null);

  const [queue, setQueue] = useState<string[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongState, setWrongState] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [timedSecondsLeft, setTimedSecondsLeft] = useState<number | null>(null);
  const [timedBestScore, setTimedBestScore] = useState(0);

  const regionConfig = REGIONS.find((r) => r.id === region)!;

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    setMode('explore');
    setTarget(null);
    setQueue([]);
    fetch(regionConfig.dataUrl)
      .then((r) => r.json())
      .then((data: FeatureCollection<Geometry, { name: string }>) => {
        setFeatures(data.features as MapFeature[]);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Could not load map data');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const featureCollection = useMemo<FeatureCollection>(
    () => ({ type: 'FeatureCollection', features }),
    [features]
  );

  const pathGen = useMemo(() => {
    if (features.length === 0) return null;
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], featureCollection);
    return geoPath(projection);
  }, [features, featureCollection]);

  const stateInfo = useCallback(
    (name: string) => INDIA_STATES.find((s) => normalizeName(s.name) === normalizeName(name)),
    []
  );

  const startIdentifyRound = useCallback((q: string[], loop = false) => {
    if (q.length === 0) {
      if (loop) {
        // Timed mode never "runs out" — reshuffle and keep going until the clock does.
        q = shuffle(features.map((f) => getFeatureName(f.properties)));
      } else {
        toast.success('Round complete!');
        setTarget(null);
        setQueue([]);
        return;
      }
    }
    setTarget(q[0]);
    setQueue(q.slice(1));
    setFeedback(null);
    setWrongState(null);
  }, [features]);

  function startIdentifyMode() {
    setMode('identify');
    setScore(0);
    setAttempted(0);
    setSelected(null);
    startIdentifyRound(shuffle(features.map((f) => getFeatureName(f.properties))));
  }

  function startTimedMode() {
    setMode('timed');
    setScore(0);
    setAttempted(0);
    setSelected(null);
    setTimedSecondsLeft(60);
    startIdentifyRound(shuffle(features.map((f) => getFeatureName(f.properties))), true);
  }

  useEffect(() => {
    if (mode !== 'timed' || timedSecondsLeft === null) return;
    if (timedSecondsLeft <= 0) {
      setTarget(null);
      setTimedBestScore((best) => {
        const next = Math.max(best, score);
        try { localStorage.setItem(`ss_map_timed_best_${region}`, String(next)); } catch { /* ignore */ }
        return next;
      });
      return;
    }
    const t = setTimeout(() => setTimedSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [mode, timedSecondsLeft, score, region]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ss_map_timed_best_${region}`);
      setTimedBestScore(saved ? Number(saved) : 0);
    } catch {
      setTimedBestScore(0);
    }
  }, [region]);

  function handleFeatureClick(name: string) {
    if (mode === 'explore') {
      setSelected(name);
      return;
    }
    if (!target || feedback) return;
    if (mode === 'timed' && (timedSecondsLeft === null || timedSecondsLeft <= 0)) return;
    setAttempted((a) => a + 1);
    if (name === target) {
      setScore((s) => s + 1);
      setFeedback('correct');
      const nextQueue = queue;
      setTimeout(() => startIdentifyRound(nextQueue, mode === 'timed'), mode === 'timed' ? 300 : 700);
    } else {
      setFeedback('wrong');
      setWrongState(name);
      if (mode === 'timed') {
        const nextQueue = queue;
        setTimeout(() => startIdentifyRound(nextQueue, true), 500);
      } else {
        toast.error(`That's ${name} \u2014 looking for ${target}`);
      }
    }
  }

  const searchMatch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || mode !== 'explore') return null;
    return features.find((f) => getFeatureName(f.properties).toLowerCase().includes(q)) ?? null;
  }, [search, features, mode]);

  useEffect(() => {
    if (searchMatch) setSelected(getFeatureName(searchMatch.properties));
  }, [searchMatch]);

  const info = selected ? stateInfo(selected) : null;
  const unitLabel = region === 'india' ? 'states and union territories' : 'countries';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Map className="h-6 w-6 text-primary" /> Map Practice
          </h1>
          <p className="text-sm text-muted-foreground">
            Learn the {unitLabel} \u2014 explore each one, or test yourself.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {REGIONS.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    region === r.id ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" /> {r.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            <button
              onClick={() => { setMode('explore'); setTarget(null); setQueue([]); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'explore' ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Compass className="h-4 w-4" /> Explore
            </button>
            <button
              onClick={startIdentifyMode}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'identify' ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Target className="h-4 w-4" /> Identify Quiz
            </button>
            <button
              onClick={startTimedMode}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'timed' ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Zap className="h-4 w-4" /> Timed Challenge
            </button>
          </div>
        </div>
      </div>

      {mode === 'identify' && (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {target ? (
              <p className="text-sm">
                Click on: <span className="font-semibold text-primary">{target}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Round complete \u2014 tap Restart to play again.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-amber-400" /> {score}/{attempted}
            </span>
            <Button variant="outline" size="sm" onClick={startIdentifyMode}>
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </Button>
          </div>
        </GlassCard>
      )}

      {mode === 'timed' && (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {timedSecondsLeft !== null && timedSecondsLeft > 0 && target ? (
              <p className="text-sm">
                Click on: <span className="font-semibold text-primary">{target}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Time's up! Scored {score}. {score >= timedBestScore && score > 0 ? 'New best! \ud83c\udfc6' : `Best: ${timedBestScore}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold', timedSecondsLeft !== null && timedSecondsLeft <= 10 && timedSecondsLeft > 0 ? 'bg-red-500/20 text-red-300 animate-pulse' : 'text-foreground')}>
              \u23f1\ufe0f {timedSecondsLeft ?? 0}s
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-amber-400" /> {score}
            </span>
            <Button variant="outline" size="sm" onClick={startTimedMode}>
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </Button>
          </div>
        </GlassCard>
      )}

      {mode === 'explore' && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${unitLabel}...`}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading map...</p>
          ) : pathGen ? (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto w-full max-w-md">
              {features.map((f, i) => {
                const name = getFeatureName(f.properties);
                const isSelected = mode === 'explore' && selected === name;
                const isWrong = (mode === 'identify' || mode === 'timed') && wrongState === name;
                const isCorrectReveal = (mode === 'identify' || mode === 'timed') && feedback === 'correct' && target === name;
                const baseColor = colorForIndex(i);
                return (
                  <path
                    key={`${name}-${i}`}
                    d={pathGen(f) ?? ''}
                    onClick={() => handleFeatureClick(name)}
                    fill={isWrong ? '#ef4444' : isCorrectReveal ? '#22c55e' : baseColor}
                    fillOpacity={isSelected ? 0.95 : isWrong || isCorrectReveal ? 0.9 : 0.55}
                    className={cn(
                      'cursor-pointer stroke-white/30 [stroke-width:0.5px] transition-all duration-200 hover:fill-opacity-90',
                      isSelected && 'stroke-white [stroke-width:1.5px]'
                    )}
                  >
                    <title>{name}</title>
                  </path>
                );
              })}
            </svg>
          ) : null}
        </GlassCard>

        <div className="space-y-3">
          {mode === 'explore' && region === 'india' &&
            (info ? (
              <GlassCard className="space-y-3">
                <h2 className="text-lg font-bold">{info.name}</h2>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {info.type === 'state' ? 'State' : 'Union Territory'}
                </p>
                <div>
                  <p className="text-xs text-muted-foreground">Capital</p>
                  <p className="font-medium">{info.capital}</p>
                </div>
                {info.neighbors.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Borders</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {info.neighbors.map((n) => (
                        <span key={n} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px]">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
                <AskAiButton
                  label="UPSC facts about this state"
                  prompt={`Give me the most UPSC-relevant facts about ${info.name} (capital: ${info.capital}) \u2014 geography, key rivers/mountains, major schemes or issues associated with it, and anything notable for prelims or mains.`}
                />
              </GlassCard>
            ) : (
              <GlassCard><p className="text-sm text-muted-foreground">Click any state or union territory on the map to see its details.</p></GlassCard>
            ))}

          {mode === 'explore' && region === 'world' &&
            (selected ? (
              <GlassCard className="space-y-3">
                <h2 className="text-lg font-bold">{selected}</h2>
                <AskAiButton
                  label="Facts about this country"
                  prompt={`Give me the most useful facts about ${selected} for UPSC International Relations \u2014 capital, geography, its relationship with India, and any current-affairs relevance.`}
                />
              </GlassCard>
            ) : (
              <GlassCard><p className="text-sm text-muted-foreground">Click any country on the map to see it, then ask AI for details.</p></GlassCard>
            ))}

          {mode === 'identify' && (
            <GlassCard>
              <p className="text-sm text-muted-foreground">
                A name is shown above \u2014 click it on the map. You&apos;ll get instant feedback, then move to the next one automatically. Complete all {features.length} to finish a round.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
