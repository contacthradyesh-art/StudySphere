'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { toast } from 'sonner';
import {
  Award,
  ArrowRight,
  Bookmark,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Crosshair,
  Flame,
  Globe2,
  GraduationCap,
  History,
  Landmark,
  Languages,
  Layers,
  Map as MapIcon,
  MapPinned,
  Minus,
  Plus,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Tractor,
  Trophy,
  Users,
  Waves,
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
type ExploreTab = 'overview' | 'geography' | 'economy' | 'history' | 'upsc';

type Status = 'new' | 'weak' | 'learning' | 'mastered';

const WIDTH = 520;
const HEIGHT = 600;

const STATE_PALETTE = [
  '#ff7a18', '#ff5c7a', '#ffd43b', '#36d399', '#27c7b8', '#35b7ff', '#4f8cff', '#7c6cff',
  '#a56cff', '#d66cff', '#ef72c7', '#f36d95', '#ff6680', '#9bdc45', '#19c98a', '#24a9e6',
  '#6757df', '#b15de8', '#db4bb1', '#ef4d61', '#f3a529', '#3fc46b', '#159fc0', '#3b73d9',
  '#6657d8', '#a55be3', '#d74d9f', '#e04d48', '#cfa72c', '#3c9f58', '#237e86', '#2668a7',
  '#4b63c7', '#7652c6', '#a64eb5', '#c54a72',
];

const STATUS_COLORS: Record<Status, string> = {
  new: '#94a3b8',
  weak: '#ef4444',
  learning: '#f59e0b',
  mastered: '#22c55e',
};

const DIFFICULTY: Record<Difficulty, { label: string; seconds: number; points: number }> = {
  foundation: { label: 'Foundation', seconds: 12, points: 5 },
  upsc: { label: 'UPSC Level', seconds: 8, points: 10 },
  elite: { label: 'Elite', seconds: 5, points: 20 },
};

const TABS: Array<{ id: ExploreTab; label: string; icon: typeof BookOpen }> = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'geography', label: 'Geography', icon: MapPinned },
  { id: 'economy', label: 'Economy', icon: Tractor },
  { id: 'history', label: 'History', icon: History },
  { id: 'upsc', label: 'UPSC Facts', icon: GraduationCap },
];

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

function stateColor(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0;
  }
  return STATE_PALETTE[Math.abs(hash) % STATE_PALETTE.length];
}

function stateStatus(progress?: StateProgress): Status {
  if (!progress) return 'new';
  const value = accuracy(progress);
  if (value >= 70 && progress.correctCount >= 3) return 'mastered';
  if (value >= 50) return 'learning';
  return 'weak';
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
  const [exploreTab, setExploreTab] = useState<ExploreTab>('overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [showAllFacts, setShowAllFacts] = useState(false);

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
      // Ignore local storage failures.
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
        return (pa ? accuracy(pa) : -20) - (pb ? accuracy(pb) : -20);
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

  const startSmart = useCallback((focusState?: string) => {
    if (!features.length) return;
    const names = features.map(featureName);
    const pool = focusState ? [focusState] : india ? weakStates : names;
    const questions = shuffle([...pool, ...pool, ...names]);
    setMode('smart');
    setScore(0);
    setAttempted(0);
    setStreak(0);
    setFeedback(null);
    setWrongGuess(null);
    setRoundComplete(false);
    setTarget(focusState ?? questions[0] ?? null);
    setQueue(focusState ? questions : questions.slice(1));
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
    const timer = window.setTimeout(
      () => setSecondsLeft((value) => (value === null ? null : value - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [mode, target, feedback, secondsLeft, india, user, nextQuestion]);

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

  const choose = useCallback((name: string) => {
    if (mode === 'explore') {
      setSelected(name);
      setExploreTab('overview');
      setShowAllFacts(false);
      if (india) {
        try {
          localStorage.setItem('ss_map_last_explored', name);
          const saved = JSON.parse(localStorage.getItem('ss_map_bookmarks') ?? '[]') as string[];
          setBookmarked(saved.includes(name));
        } catch {
          // Ignore local storage failures.
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
    if (searchMatch) choose(featureName(searchMatch));
  }, [searchMatch, choose]);

  const selectedInfo = useMemo(() => {
    if (!selected || !india) return null;
    return INDIA_STATES.find((state) => normalize(state.name) === normalize(selected)) ?? null;
  }, [selected, india]);

  const selectedProgress = selected ? progressByName.get(normalize(selected)) : undefined;
  const selectedAccuracy = accuracy(selectedProgress);
  const selectedStatus = stateStatus(selectedProgress);
  const selectedAttempts = selectedProgress
    ? selectedProgress.correctCount + selectedProgress.incorrectCount
    : 0;
  const selectedCorrect = selectedProgress?.correctCount ?? 0;
  const selectedIncorrect = selectedProgress?.incorrectCount ?? 0;

  const toggleBookmark = useCallback(() => {
    if (!selected || !india) return;
    try {
      const current = JSON.parse(localStorage.getItem('ss_map_bookmarks') ?? '[]') as string[];
      const next = current.includes(selected)
        ? current.filter((item) => item !== selected)
        : [...current, selected];
      localStorage.setItem('ss_map_bookmarks', JSON.stringify(next));
      setBookmarked(next.includes(selected));
      toast.success(next.includes(selected) ? 'State bookmarked' : 'Bookmark removed');
    } catch {
      toast.error('Could not update bookmark');
    }
  }, [selected, india]);

  const neighbourFocus = useCallback((name: string) => {
    setMode('explore');
    setSelected(name);
    setExploreTab('overview');
    setSearch('');
    if (india) {
      try {
        localStorage.setItem('ss_map_last_explored', name);
        const saved = JSON.parse(localStorage.getItem('ss_map_bookmarks') ?? '[]') as string[];
        setBookmarked(saved.includes(name));
      } catch {
        // Ignore local storage failures.
      }
    }
  }, [india]);

  const tabItems = useMemo(() => {
    if (!selectedInfo) return [];
    const base = [
      { label: 'Capital', value: selectedInfo.capital, icon: Landmark },
      { label: 'Type', value: selectedInfo.type === 'state' ? 'State' : 'Union Territory', icon: Layers },
      { label: 'Land neighbours', value: `${selectedInfo.neighbors.length}`, icon: Route },
      { label: 'Map accuracy', value: selectedProgress ? `${selectedAccuracy}%` : 'New', icon: Target },
    ];
    return base;
  }, [selectedInfo, selectedProgress, selectedAccuracy]);

  const facts = useMemo(() => {
    if (!selectedInfo) return [] as string[];
    return [
      `${selectedInfo.name} — ${selectedInfo.type === 'state' ? 'State' : 'Union Territory'}.`,
      `Capital: ${selectedInfo.capital}.`,
      selectedInfo.neighbors.length
        ? `Direct Indian land neighbours: ${selectedInfo.neighbors.join(', ')}.`
        : 'No direct Indian land-border neighbours are listed in the map schema.',
      'UPSC map drill: connect the state with its capital, neighbours and relative position.',
      'Prelims trap check: distinguish land neighbours from nearby countries or maritime neighbours.',
      'Revision cue: locate this region first, then recall its capital without looking.',
    ];
  }, [selectedInfo]);

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-primary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" /> Advanced Geography Lab
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <MapIcon className="h-7 w-7 text-primary" /> Map Practice
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Explore states visually, inspect UPSC-relevant relationships, and turn every map click into a practice opportunity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRegion('india')} className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all', region === 'india' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground')}>
              <Landmark className="h-4 w-4" /> India
            </button>
            <button type="button" onClick={() => setRegion('world')} className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all', region === 'world' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground')}>
              <Globe2 className="h-4 w-4" /> World
            </button>
          </div>
        </div>
      </section>

      {india && user && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Target className="h-4 w-4 text-primary" /> Accuracy</div><p className="mt-1 text-xl font-bold">{stats.accuracyPct}%</p></GlassCard>
          <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Mastery</div><p className="mt-1 text-xl font-bold">{masteryPct}%</p></GlassCard>
          <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Award className="h-4 w-4 text-primary" /> States</div><p className="mt-1 text-xl font-bold">{masteredCount}/{features.length}</p></GlassCard>
          <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Brain className="h-4 w-4 text-primary" /> Weak Areas</div><p className="mt-1 text-xl font-bold">{weakStates.length}</p></GlassCard>
          <GlassCard className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Flame className="h-4 w-4 text-primary" /> Streak</div><p className="mt-1 text-xl font-bold">{streak}</p></GlassCard>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={goExplore} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all', mode === 'explore' ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}><Compass className="h-4 w-4" /> Explore</button>
          <button type="button" onClick={() => startSmart()} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all', mode === 'smart' ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}><Brain className="h-4 w-4" /> Smart Practice</button>
          <button type="button" onClick={startTimed} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all', mode === 'timed' ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}><Timer className="h-4 w-4" /> 60s Sprint</button>
        </div>
        {mode !== 'explore' && (
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map((item) => (
              <button type="button" key={item} onClick={() => setDifficulty(item)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', difficulty === item ? 'bg-white/10 text-foreground' : 'text-muted-foreground')}>
                {DIFFICULTY[item].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === 'smart' && target && (
        <GlassCard className="border-primary/20 bg-primary/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Adaptive mission</p><p className="mt-1 text-sm">Locate <strong className="text-primary">{target}</strong> on the map.</p></div>
            <div className="flex items-center gap-4 text-sm font-semibold"><span><Trophy className="mr-1 inline h-4 w-4 text-amber-400" />{score} pts</span><span><Flame className="mr-1 inline h-4 w-4 text-orange-400" />{streak}</span>{secondsLeft !== null && <span>{secondsLeft}s</span>}</div>
          </div>
        </GlassCard>
      )}

      {mode === 'timed' && (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-semibold">{target ? <>Find <span className="text-primary">{target}</span></> : 'Sprint finished'}</p><p className="text-xs text-muted-foreground">Fast recall. Every correct answer keeps your score moving.</p></div>
          <div className="flex items-center gap-4 text-sm font-bold"><span className="rounded-lg bg-white/5 px-3 py-1.5">{secondsLeft ?? 0}s</span><span><Trophy className="mr-1 inline h-4 w-4 text-amber-400" />{score}</span><Button size="sm" variant="outline" onClick={startTimed}><RotateCcw className="h-4 w-4" /> Restart</Button></div>
        </GlassCard>
      )}

      {feedback && mode !== 'explore' && (
        <div className={cn('flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold', feedback === 'correct' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300')}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{feedback === 'correct' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
          {feedback === 'correct' ? `Correct! +${mode === 'smart' ? DIFFICULTY[difficulty].points : 1} points.` : `Not quite${wrongGuess ? ` — you clicked ${wrongGuess}` : ''}. The answer is ${target}.`}
        </div>
      )}

      {mode === 'explore' && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${india ? 'states and union territories' : 'countries'}...`} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <GlassCard className="relative overflow-hidden p-2 sm:p-4">
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1 rounded-xl border border-white/10 bg-secondary/90 p-1 backdrop-blur">
            <button type="button" onClick={() => setZoom((value) => Math.min(4, value + 0.5))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
            <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
            <button type="button" onClick={() => setZoom(1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Reset zoom"><Crosshair className="h-4 w-4" /></button>
          </div>

          <div className="absolute left-5 top-5 z-10 pointer-events-none">
            <p className="text-lg font-bold">{india ? 'India — States & UTs' : 'World — Countries'}</p>
            <p className="text-xs text-muted-foreground">Click any region to explore</p>
          </div>

          {loading ? (
            <div className="flex h-[600px] items-center justify-center text-sm text-muted-foreground">Loading geography lab...</div>
          ) : pathGen ? (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto h-auto max-h-[650px] w-full max-w-[640px]">
              <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
                <defs>
                  <filter id="stateGlow"><feGaussianBlur stdDeviation="2.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                {features.map((feature, index) => {
                  const name = featureName(feature);
                  const itemProgress = progressByName.get(normalize(name));
                  const status = stateStatus(itemProgress);
                  const isSelected = mode === 'explore' && selected === name;
                  const isTarget = mode !== 'explore' && target === name;
                  const isWrong = wrongGuess === name;
                  const statusColor = STATUS_COLORS[status];
                  return (
                    <path
                      key={`${name}-${index}`}
                      d={pathGen(feature) ?? ''}
                      onClick={() => choose(name)}
                      fill={isWrong ? '#ef4444' : stateColor(name)}
                      fillOpacity={isSelected ? 1 : 0.9}
                      stroke={isSelected || isTarget ? '#ffffff' : 'rgba(255,255,255,.72)'}
                      strokeWidth={isSelected || isTarget ? 2.6 : 1.05}
                      filter={isSelected || isTarget || isWrong ? 'url(#stateGlow)' : undefined}
                      className="cursor-pointer transition-all duration-200 hover:brightness-125"
                      aria-label={`${name}${itemProgress ? `, ${accuracy(itemProgress)} percent accuracy` : ''}`}
                    >
                      <title>{name}{itemProgress ? ` • ${accuracy(itemProgress)}% accuracy • ${status}` : ''}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
          ) : null}

          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] backdrop-blur">
            <span className="font-semibold text-foreground">Map Mastery</span>
            {(['mastered', 'learning', 'weak', 'new'] as Status[]).map((status) => (
              <span key={status} className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />{status === 'new' ? 'Not Attempted' : status[0].toUpperCase() + status.slice(1)}</span>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-3">
          {mode === 'explore' && selectedInfo ? (
            <GlassCard className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-gradient-to-br from-primary/15 via-transparent to-cyan-400/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700 via-primary/30 to-cyan-400/20 text-3xl shadow-inner">🗺️</div>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{selectedInfo.name}</h2><span className="rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-bold text-amber-300">{selectedInfo.type === 'state' ? 'State' : 'Union Territory'}</span></div>
                      <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs text-muted-foreground"><span>Capital <strong className="text-foreground">{selectedInfo.capital}</strong></span><span>Neighbours <strong className="text-foreground">{selectedInfo.neighbors.length}</strong></span></div>
                    </div>
                  </div>
                  <button type="button" onClick={toggleBookmark} className={cn('rounded-xl p-2 transition-colors', bookmarked ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/10 hover:text-foreground')} aria-label="Bookmark state"><Bookmark className="h-5 w-5" fill={bookmarked ? 'currentColor' : 'none'} /></button>
                </div>
              </div>

              <div className="flex overflow-x-auto border-b border-white/10 px-2 pt-2">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button type="button" key={id} onClick={() => setExploreTab(id)} className={cn('flex shrink-0 items-center gap-1.5 rounded-t-xl px-3 py-2 text-xs font-semibold transition-colors', exploreTab === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground')}><Icon className="h-3.5 w-3.5" />{label}</button>
                ))}
              </div>

              <div className="space-y-4 p-4">
                {exploreTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {tabItems.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-3"><div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground"><Icon className="h-3.5 w-3.5 text-primary" />{label}</div><p className="mt-1 font-semibold">{value}</p></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[10px] text-muted-foreground">Attempts</p><p className="mt-1 text-lg font-bold">{selectedAttempts}</p></div>
                      <div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[10px] text-muted-foreground">Correct</p><p className="mt-1 text-lg font-bold text-emerald-400">{selectedCorrect}</p></div>
                      <div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[10px] text-muted-foreground">Incorrect</p><p className="mt-1 text-lg font-bold text-red-400">{selectedIncorrect}</p></div>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-primary/[0.05] p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold">Map mastery</p><p className="mt-1 text-xs text-muted-foreground">{selectedProgress ? `${selectedAccuracy}% accuracy` : 'Not attempted yet'}</p></div><span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ color: STATUS_COLORS[selectedStatus], backgroundColor: `${STATUS_COLORS[selectedStatus]}20` }}>{selectedStatus}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${selectedAccuracy}%` }} /></div></div>
                  </>
                )}

                {exploreTab === 'geography' && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-3"><div className="flex items-center gap-2 text-sm font-semibold"><MapPinned className="h-4 w-4 text-cyan-300" /> Border Map</div><p className="mt-1 text-xs text-muted-foreground">Direct Indian land neighbours are listed below. Tap any one to jump directly to that region.</p><div className="mt-3 flex flex-wrap gap-2">{selectedInfo.neighbors.length ? selectedInfo.neighbors.map((neighbor) => <button type="button" key={neighbor} onClick={() => neighbourFocus(neighbor)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] hover:border-primary/40 hover:bg-primary/10">{neighbor}<ChevronRight className="ml-1 inline h-3 w-3" /></button>) : <span className="text-xs text-muted-foreground">No direct Indian land neighbours.</span>}</div></div>
                    <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[10px] text-muted-foreground">Capital recall</p><p className="mt-1 font-semibold">{selectedInfo.capital}</p></div><div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[10px] text-muted-foreground">Neighbour links</p><p className="mt-1 font-semibold">{selectedInfo.neighbors.length}</p></div></div>
                    <div className="rounded-xl bg-white/[0.035] p-3 text-xs text-muted-foreground"><Waves className="mr-2 inline h-4 w-4 text-cyan-300" />UPSC drill: locate the state, trace its neighbours, then recall its capital without looking.</div>
                  </div>
                )}

                {exploreTab === 'economy' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['Agriculture', 'Crops & irrigation', Tractor],
                        ['Industry', 'Clusters & resources', Layers],
                        ['Services', 'Cities & connectivity', Users],
                      ].map(([title, text, Icon]) => <div key={String(title)} className="rounded-xl border border-white/8 bg-white/[0.035] p-3"><Icon className="h-4 w-4 text-emerald-300" /><p className="mt-2 text-xs font-semibold">{title}</p><p className="mt-1 text-[10px] text-muted-foreground">{text}</p></div>)}
                    </div>
                    <p className="text-xs text-muted-foreground">Economy tab is a structured revision board: use it to connect the selected state with agriculture, resources, industry, services and transport topics.</p>
                    <AskAiButton label="Ask AI: state economy" prompt={`Create a UPSC Prelims-focused economic profile of ${selectedInfo.name}: major crops, irrigation, minerals/resources, industries, ports/corridors where relevant, services, and common map-based economic questions. Clearly distinguish established facts from exam-oriented inference.`} />
                  </div>
                )}

                {exploreTab === 'history' && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4"><div className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-amber-300" /> History Revision Board</div><div className="mt-3 space-y-2 text-xs text-muted-foreground"><p>• Formation / reorganisation and important dates</p><p>• Major dynasties, movements and historical regions</p><p>• Important sites, personalities and cultural traditions</p><p>• Map-linked locations that appear in Prelims</p></div></div>
                    <AskAiButton label="Ask AI: history map facts" prompt={`Give me a high-yield UPSC history + map revision sheet for ${selectedInfo.name}, covering formation/reorganisation, important historical regions, sites, movements, personalities, cultural geography and common Prelims traps.`} />
                  </div>
                )}

                {exploreTab === 'upsc' && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-primary/15 bg-primary/[0.05] p-3"><div className="flex items-center justify-between"><div><p className="font-semibold">UPSC Key Facts</p><p className="text-[10px] text-muted-foreground">Fast recall checklist</p></div><GraduationCap className="h-5 w-5 text-primary" /></div></div>
                    <div className="space-y-2">{(showAllFacts ? facts : facts.slice(0, 4)).map((fact) => <div key={fact} className="flex gap-2 rounded-xl bg-white/[0.035] p-3 text-xs"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>{fact}</span></div>)}</div>
                    <button type="button" onClick={() => setShowAllFacts((value) => !value)} className="text-xs font-semibold text-primary hover:underline">{showAllFacts ? 'Show fewer facts' : 'View all facts'}</button>
                    <AskAiButton label="AI Ask about this state" prompt={`Act as a UPSC Prelims geography coach. Give me a concise but deep fact sheet for ${selectedInfo.name}, including location, borders, capital, physical geography, rivers, mountains, national parks, economy, history, neighbouring countries where relevant, and common map traps. Avoid unsupported facts.`} />
                  </div>
                )}

                <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Your Performance</div>
                  <div className="grid grid-cols-4 gap-2 text-center"><div><p className="text-lg font-bold">{selectedAccuracy}%</p><p className="text-[9px] text-muted-foreground">Accuracy</p></div><div><p className="text-lg font-bold">{selectedAttempts}</p><p className="text-[9px] text-muted-foreground">Attempts</p></div><div><p className="text-lg font-bold text-emerald-400">{selectedCorrect}</p><p className="text-[9px] text-muted-foreground">Correct</p></div><div><p className="text-lg font-bold" style={{ color: STATUS_COLORS[selectedStatus] }}>{selectedStatus}</p><p className="text-[9px] text-muted-foreground">Mastery</p></div></div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button onClick={() => startSmart(selectedInfo.name)} className="bg-gradient-brand"><Zap className="h-4 w-4" /> Start Practice on {selectedInfo.name}</Button>
                  <AskAiButton label="AI Ask about this state" prompt={`Teach me ${selectedInfo.name} for UPSC Prelims using map-first learning. Include capital, borders, geography, economy, history, important locations and map traps.`} />
                </div>
              </div>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h2 className="font-bold">Adaptive Intelligence</h2></div>
                <p className="text-sm text-muted-foreground">Select a state to open the full Explore State lab, or let Smart Practice attack your weakest recall first.</p>
                {india && weakStates.length > 0 && <div className="space-y-2">{weakStates.slice(0, 5).map((name, index) => { const itemProgress = progressByName.get(normalize(name)); return <button type="button" key={name} onClick={() => neighbourFocus(name)} className="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left hover:bg-white/10"><span className="flex items-center gap-2 text-sm"><span className="text-xs text-muted-foreground">#{index + 1}</span>{name}</span><span className="text-xs font-semibold text-primary">{itemProgress ? `${accuracy(itemProgress)}%` : 'New'}</span></button>; })}</div>}
                <Button className="w-full bg-gradient-brand" onClick={() => startSmart()}><Brain className="h-4 w-4" /> Start Smart Practice</Button>
              </GlassCard>

              {india && user && <GlassCard><button type="button" onClick={() => setShowMastery((value) => !value)} className="flex w-full items-center justify-between"><span className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Mastery Matrix</span><span className="text-xs text-muted-foreground">{showMastery ? 'Hide' : 'View'}</span></button>{showMastery && <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-auto">{features.map((feature) => { const name = featureName(feature); const itemProgress = progressByName.get(normalize(name)); const value = accuracy(itemProgress); const status = stateStatus(itemProgress); return <div key={name} className="rounded-lg bg-white/5 p-2"><div className="flex items-center justify-between gap-2 text-[11px]"><span className="truncate">{name}</span><span className="font-bold" style={{ color: STATUS_COLORS[status] }}>{itemProgress ? `${value}%` : '—'}</span></div><div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, value)}%` }} /></div></div>; })}</div>}</GlassCard>}

              {lastState && <GlassCard className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Continue learning</p><p className="font-semibold">{lastState}</p></div><button type="button" onClick={() => neighbourFocus(lastState)} className="rounded-lg bg-primary/10 p-2 text-primary" aria-label="Continue learning"><RotateCcw className="h-4 w-4" /></button></GlassCard>}
            </>
          )}
        </div>
      </div>

      {roundComplete && mode !== 'explore' && <GlassCard className="flex flex-col items-center gap-3 py-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg"><Trophy className="h-7 w-7" /></div><h2 className="text-xl font-bold">Session complete</h2><p className="text-sm text-muted-foreground">{score} points • {attempted ? Math.round((score / attempted) * 100) : 0}% session performance • {streak} current streak</p><Button onClick={mode === 'smart' ? () => startSmart() : startTimed} className="bg-gradient-brand"><Zap className="h-4 w-4" /> Go again</Button></GlassCard>}
    </div>
  );
}
