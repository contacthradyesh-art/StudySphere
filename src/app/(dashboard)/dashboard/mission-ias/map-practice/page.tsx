'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import { Map, Target, Compass, RotateCcw, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INDIA_STATES } from '@/lib/mission-ias/map-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';

type StateFeature = Feature<Geometry, { name: string }>;

const WIDTH = 500;
const HEIGHT = 600;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MapPracticePage() {
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'explore' | 'identify'>('explore');
  const [selected, setSelected] = useState<string | null>(null);

  const [queue, setQueue] = useState<string[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongState, setWrongState] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/india-states.geojson')
      .then((r) => r.json())
      .then((data: FeatureCollection<Geometry, { name: string }>) => {
        setFeatures(data.features as StateFeature[]);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Could not load map data');
        setLoading(false);
      });
  }, []);

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

  const startIdentifyRound = useCallback((q: string[]) => {
    if (q.length === 0) {
      toast.success(`Round complete!`);
      setTarget(null);
      setQueue([]);
      return;
    }
    setTarget(q[0]);
    setQueue(q.slice(1));
    setFeedback(null);
    setWrongState(null);
  }, []);

  function startIdentifyMode() {
    setMode('identify');
    setScore(0);
    setAttempted(0);
    setSelected(null);
    startIdentifyRound(shuffle(features.map((f) => getFeatureName(f.properties))));
  }

  function handleStateClick(name: string) {
    if (mode === 'explore') {
      setSelected(name);
      return;
    }
    if (!target || feedback) return;
    setAttempted((a) => a + 1);
    if (name === target) {
      setScore((s) => s + 1);
      setFeedback('correct');
      const nextQueue = queue;
      setTimeout(() => startIdentifyRound(nextQueue), 700);
    } else {
      setFeedback('wrong');
      setWrongState(name);
      toast.error(`That's ${name} \u2014 looking for ${target}`);
    }
  }

  const info = selected ? stateInfo(selected) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Map className="h-6 w-6 text-primary" /> Map Practice
          </h1>
          <p className="text-sm text-muted-foreground">
            Learn India&apos;s states and union territories \u2014 explore each one, or test yourself.
          </p>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading map...</p>
          ) : pathGen ? (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto w-full max-w-md">
              {features.map((f) => {
                const name = getFeatureName(f.properties);
                const isSelected = mode === 'explore' && selected === name;
                const isWrong = mode === 'identify' && wrongState === name;
                const isCorrectReveal = mode === 'identify' && feedback === 'correct' && target === name;
                return (
                  <path
                    key={name}
                    d={pathGen(f) ?? ''}
                    onClick={() => handleStateClick(name)}
                    className={cn(
                      'cursor-pointer stroke-white/20 [stroke-width:0.5px] transition-colors',
                      isSelected && 'fill-primary',
                      isWrong && 'fill-red-500/70',
                      isCorrectReveal && 'fill-emerald-500/70',
                      !isSelected && !isWrong && !isCorrectReveal && 'fill-white/10 hover:fill-primary/40'
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
          {mode === 'explore' &&
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

          {mode === 'identify' && (
            <GlassCard>
              <p className="text-sm text-muted-foreground">
                A state/UT name is shown above \u2014 click it on the map. You&apos;ll get instant feedback, then move to the next one automatically. Complete all {INDIA_STATES.length} to finish a round.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}