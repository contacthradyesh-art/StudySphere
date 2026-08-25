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
  Map as MapIcon,
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
const PALETTE = ['#7c3aed', '#8b5cf6', '#a855f7', '#9333ea', '#c026d3', '#d946ef', '#6366f1', '#4f46e5'];
const DIFFICULTY: Record<Difficulty, { label: string; seconds: number; points: number }> = {
  foundation: { label: 'Foundation', seconds: 12, points: 5 },
  upsc: { label: 'UPSC', seconds: 8, points: 10 },
  elite: { label: 'Elite', seconds: 5, points: 20 },
};

const normalize = (value: string) => value.trim().toLowerCase();
const featureName = (feature: MapFeature) => feature.properties?.name ?? 'Unknown';

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function accuracy(progress?: StateProgress) {
  if (!progress) return 0;
  const attempts = progress.correctCount + progress.incorrectCount;
  return attempts ? Math.round((progress.correctCount / attempts) * 100) : 0;
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
  const [streak, setStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showMastery, setShowMastery] = useState(false);
  const [lastState, setLastState] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);

  const india = region === 'india';
  const regionUrl = india ? '/data/india-states.geojson' : '/data/world-countries.geojson';

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
    void getMapProgress().then(setProgress).catch(() => undefined);
    try {
      setLastState(localStorage.getItem('ss_map_last_explored'));
    } catch {
      // Ignore local storage errors.
    }
  }, [user, india]);

  const progressByName = useMemo(
    () => new Map(progress.map((item) => [normalize(item.stateName), item])),
    [progress],
  );

  const stats = useMemo(() => summarizeMapProgress(progress), [progress]);

  const weakStates = useMemo(() => {
    if (!india) return [];
    return features
      .map(featureName)
      .sort((a, b) => {
        const pa = progressByName.get(normalize(a));
        const pb = progressByName.get(normalize(b));
        const aa = pa ? accuracy(pa) : -20;
        const ab = pb ? accuracy(pb) : -20;
        return aa - ab;
      })
      .slice(0, 8);
  }, [features, progressByName, india]);

  const masteredCount = useMemo(
    () => progress.filter((item) => item.correctCount >= 3 && accuracy(item) >= 70).length,
    [progress],
  );

  const masteryPct = india && features.length
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

  const pathGen = useMemo(() => (projection ? geoPath(projection) : null), [projection]);

  const startSmart = useCallback(() => {
    if (!features.length) return;
    const names = features.map(featureName);
    const pool = india ? weakStates : names;
    const questions = shuffle([...pool, ...pool, ...names]);
    setMode('smart');
    setScore(0);
    setAttempted(0);
    setStreak(0);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
    setTarget(questions[0] ?? null);
    setQueue(questions.slice(1));
    setSecondsLeft(DIFFICULTY[difficulty].seconds);
  }, [features, weakStates, india, difficulty]);

  const startTimed = useCallback(() => {
    if (!features.length) return;
    const questions = shuffle(features.map(featureName));
    setMode('timed');
    setScore(0);
    setAttempted(0);
    setStreak(0);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
    setTarget(questions[0] ?? null);
    setQueue(questions.slice(1));
    setSecondsLeft(60);
  }, [features]);

  const goExplore = useCallback(() => {
    setMode('explore');
    setTarget(null);
    setSecondsLeft(null);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
  }, []);

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setWrongGuess(null);
    if (!queue.length) {
      if (mode === 'timed' && features.length) {
        const questions = shuffle(features.map(featureName));
        setTarget(questions[0] ?? null);
        setQueue(questions.slice(1));
      } else {
        setTarget(null);
        setSecondsLeft(null);
        setRoundComplete(true);
        toast.success('Advanced round complete!');
      }
      return;
    }
    setTarget(queue[0]);
    setQueue((current) => current.slice(1));
    if (mode === 'smart') setSecondsLeft(DIFFICULTY[difficulty].seconds);
  }, [queue, mode, features, difficulty]);

  useEffect(() => {
    if (mode !== 'smart' || !target || feedback || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setAttempted((value) => value + 1);
      setStreak(0);
      setFeedback('wrong');
      if (india && user) {
        void recordMapAttempt(target, false).then(() => getMapProgress()).then(setProgress).catch(() => undefined);
      }
      const timer = window.setTimeout(nextQuestion, 550);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [mode, target, feedback, secondsLeft, india, user, nextQuestion]);

  useEffect(() => {
    if (mode !== 'timed' || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setTarget(null);
      setRoundComplete(true);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [mode, secondsLeft]);

  const choose = useCallback((name: string) => {
    if (mode === 'explore') {
      setSelected(name);
      setLastState(name);
      if (india) {
        try {
          localStorage.setItem('ss_map_last_explored', name);
        } catch {
          // Ignore local storage errors.
        }
      }
      return;
    }

    if (!target || feedback || (mode === 'timed' && (secondsLeft ?? 0) <= 0)) return;
    const correct = normalize(name) === normalize(target);
    setAttempted((value) => value + 1);

    if (correct) {
      const points = mode === 'smart' ? DIFFICULTY[difficulty].points : 1;
      setScore((value) => value + points);
      setStreak((value) => value + 1);
      setFeedback('correct');
      if (india && user) {
        void recordMapAttempt(target, true).then(() => getMapProgress()).then(setProgress).catch(() => undefined);
        void awardXp(user.uid, 'mapPracticeCorrect');
      }
      window.setTimeout(nextQuestion, mode === 'timed' ? 220 : 650);
      return;
    }

    setFeedback('wrong');
    setWrongGuess(name);
    setStreak(0);
    if (india && user) {
      void recordMapAttempt(target, false).then(() => getMapProgress()).then(setProgress).catch(() => undefined);
    }
    if (mode === 'timed') window.setTimeout(nextQuestion, 350);
  }, [mode, target, feedback, secondsLeft, difficulty, india, user, nextQuestion]);

  const searchMatch = useMemo(() => {
    const query = normalize(search);
    if (!query || mode !== 'explore') return null;
    return features.find((feature) => normalize(featureName(feature)).includes(query)) ?? null;
  }, [search, mode, features]);

  useEffect(() => {
    if (searchMatch) setSelected(featureName(searchMatch));
  }, [searchMatch]);

  const selectedInfo = useMemo(() => {
    if (!selected || !india) return null;
    return INDIA_STATES.find((state) => normalize(state.name) === normalize(selected)) ?? null;
  }, [selected, india]);

  const selectedProgress = selected ? progressByName.get(normalize(selected)) : undefined;

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-primary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Advanced Geography Lab</div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl"><MapIcon className="h-7 w-7 text-primary" /> Map Practice</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Adaptive UPSC map training: explore, diagnose weak areas, build recall speed, and master the map.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setRegion('india')} className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold', region === 'india' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground')}><Landmark className="h-4 w-4" /> India</button>
            <button type="button" onClick={() => setRegion('world')} className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold', region === 'world' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground')}><Globe2 className="h-4 w-4" /> World</button>
          </div>
        </div>
      </section>

      {india && user && <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Target className="h-4 w-4 text-primary" /> Accuracy</div><p className="mt-1 text-xl font-bold">{stats.accuracyPct}%</p></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Mastery</div><p className="mt-1 text-xl font-bold">{masteryPct}%</p></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Award className="h-4 w-4 text-primary" /> States</div><p className="mt-1 text-xl font-bold">{masteredCount}/{features.length}</p></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Brain className="h-4 w-4 text-primary" /> Weak Areas</div><p className="mt-1 text-xl font-bold">{weakStates.length}</p></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Flame className="h-4 w-4 text-primary" /> Streak</div><p className="mt-1 text-xl font-bold">{streak}</p></GlassCard>
      </div>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={goExplore} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold', mode === 'explore' ? 'bg-gradient-brand text-white' : 'text-muted-foreground')}><Compass className="h-4 w-4" /> Explore</button>
          <button type="button" onClick={startSmart} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold', mode === 'smart' ? 'bg-gradient-brand text-white' : 'text-muted-foreground')}><Brain className="h-4 w-4" /> Smart Practice</button>
          <button type="button" onClick={startTimed} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold', mode === 'timed' ? 'bg-gradient-brand text-white' : 'text-muted-foreground')}><Timer className="h-4 w-4" /> 60s Sprint</button>
        </div>
        {mode !== 'explore' && <div className="flex gap-1 rounded-xl bg-secondary p-1">{(Object.keys(DIFFICULTY) as Difficulty[]).map((item) => <button type="button" key={item} onClick={() => setDifficulty(item)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', difficulty === item ? 'bg-white/10 text-foreground' : 'text-muted-foreground')}>{DIFFICULTY[item].label}</button>)}</div>}
      </div>

      {mode !== 'explore' && <GlassCard className="border-primary/20 bg-primary/[0.05] flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{target ? <>Locate <span className="text-primary">{target}</span> on the map.</> : 'Session complete'}</p><div className="flex items-center gap-4 text-sm font-bold"><span><Trophy className="mr-1 inline h-4 w-4" />{score}</span><span><Flame className="mr-1 inline h-4 w-4" />{streak}</span>{secondsLeft !== null && <span>{secondsLeft}s</span>}</div></GlassCard>}

      {feedback && <div className={cn('flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold', feedback === 'correct' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300')}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{feedback === 'correct' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>{feedback === 'correct' ? `Correct! +${mode === 'smart' ? DIFFICULTY[difficulty].points : 1} points.` : `Not quite${wrongGuess ? ` — you clicked ${wrongGuess}` : ''}. Answer: ${target}.`}</div>}

      {mode === 'explore' && <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${india ? 'states and union territories' : 'countries'}...`} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary/40" /></div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.7fr)]">
        <GlassCard className="relative overflow-hidden p-2 sm:p-4">
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1 rounded-xl border border-white/10 bg-secondary/85 p-1 backdrop-blur">
            <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(4, value + 0.5))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><Plus className="h-4 w-4" /></button>
            <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><Minus className="h-4 w-4" /></button>
            <button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><Crosshair className="h-4 w-4" /></button>
          </div>
          {loading ? <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">Loading geography lab...</div> : pathGen ? <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto h-auto max-h-[650px] w-full max-w-[560px]"><g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}><defs><filter id="mapGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>{features.map((feature, index) => { const name = featureName(feature); const item = progressByName.get(normalize(name)); const selectedHere = mode === 'explore' && selected === name; const targetHere = mode !== 'explore' && target === name; const wrongHere = wrongGuess === name; return <path key={`${name}-${index}`} d={pathGen(feature) ?? ''} onClick={() => choose(name)} fill={wrongHere ? '#ef4444' : feedback === 'correct' && targetHere ? '#22c55e' : PALETTE[index % PALETTE.length]} fillOpacity={selectedHere ? 0.95 : mode === 'explore' ? 0.68 : 0.6} stroke={selectedHere || targetHere ? 'white' : 'rgba(255,255,255,.22)'} strokeWidth={selectedHere || targetHere ? 1.8 : 0.55} filter={selectedHere || targetHere || wrongHere ? 'url(#mapGlow)' : undefined} className="cursor-pointer transition-all duration-200 hover:brightness-125" aria-label={name}><title>{name}{item ? ` • ${accuracy(item)}% accuracy` : ''}</title></path>; })}</g></svg> : null}
        </GlassCard>

        <div className="space-y-3">
          {mode === 'explore' && selected ? <GlassCard className="space-y-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">Selected region</p><h2 className="mt-1 text-xl font-bold">{selected}</h2></div>{selectedProgress && <div className="rounded-xl bg-primary/10 px-3 py-2 text-center"><p className="text-lg font-bold">{accuracy(selectedProgress)}%</p><p className="text-[10px] text-muted-foreground">accuracy</p></div>}</div>{selectedInfo && <><div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="mt-1 font-medium">{selectedInfo.type === 'state' ? 'State' : 'Union Territory'}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-muted-foreground">Capital</p><p className="mt-1 font-medium">{selectedInfo.capital}</p></div></div><div><p className="text-xs text-muted-foreground">Borders</p><div className="mt-1 flex flex-wrap gap-1">{selectedInfo.neighbors.map((neighbor) => <span key={neighbor} className="rounded-full border border-white/10 px-2 py-1 text-[11px]">{neighbor}</span>)}</div></div><AskAiButton label="UPSC facts & map traps" prompt={`Give me high-yield UPSC Prelims facts about ${selectedInfo.name}: capital, neighbouring states/countries, rivers, physical geography, national parks, borders, and common map-based traps.`} /></>}</GlassCard> : <GlassCard className="space-y-4"><div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h2 className="font-bold">Adaptive Intelligence</h2></div><p className="text-sm text-muted-foreground">Practice focuses on weak recall instead of repeating what you already know.</p>{india && user && <div className="space-y-2">{weakStates.slice(0, 5).map((name, index) => <button type="button" key={name} onClick={() => { goExplore(); setSelected(name); }} className="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left hover:bg-white/10"><span className="flex items-center gap-2 text-sm"><span className="text-xs text-muted-foreground">#{index + 1}</span>{name}</span><span className="text-xs font-semibold text-primary">{progressByName.get(normalize(name)) ? `${accuracy(progressByName.get(normalize(name)))}%` : 'New'}</span></button>)}</div>}<Button className="w-full bg-gradient-brand" onClick={startSmart}><Brain className="h-4 w-4" /> Start Smart Practice</Button></GlassCard>}

          {india && user && <GlassCard><button type="button" onClick={() => setShowMastery((value) => !value)} className="flex w-full items-center justify-between"><span className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Mastery Matrix</span><span className="text-xs text-muted-foreground">{showMastery ? 'Hide' : 'View'}</span></button>{showMastery && <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-auto">{features.map((feature) => { const name = featureName(feature); const item = progressByName.get(normalize(name)); const itemAccuracy = accuracy(item); const mastered = !!item && item.correctCount >= 3 && itemAccuracy >= 70; return <div key={name} className="rounded-lg bg-white/5 p-2"><div className="flex items-center justify-between gap-2 text-[11px]"><span className="truncate">{name}</span><span className={cn('font-bold', mastered ? 'text-emerald-400' : itemAccuracy >= 50 ? 'text-amber-400' : 'text-red-400')}>{item ? `${itemAccuracy}%` : '—'}</span></div><div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${itemAccuracy}%` }} /></div></div>; })}</div>}</GlassCard>}

          {lastState && <GlassCard className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Continue learning</p><p className="font-semibold">{lastState}</p></div><button type="button" onClick={() => { goExplore(); setSelected(lastState); }} className="rounded-lg bg-primary/10 p-2 text-primary" aria-label="Continue learning"><RotateCcw className="h-4 w-4" /></button></GlassCard>}
        </div>
      </div>

      {roundComplete && mode !== 'explore' && <GlassCard className="flex flex-col items-center gap-3 py-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg"><Trophy className="h-7 w-7" /></div><h2 className="text-xl font-bold">Session complete</h2><p className="text-sm text-muted-foreground">{score} points • {attempted ? Math.round((score / attempted) * 100) : 0}% session performance</p><Button onClick={mode === 'smart' ? startSmart : startTimed} className="bg-gradient-brand"><Zap className="h-4 w-4" /> Go again</Button></GlassCard>}
    </div>
  );
}
