'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { toast } from 'sonner';
import {
  Award, Brain, Check, Compass, Crosshair, Flame, Globe2, Landmark,
  Map as MapIcon, Minus, Plus, RotateCcw, Search, ShieldCheck, Sparkles,
  Target, Timer, Trophy, X, Zap
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { AskAiButton } from '@/components/ai/ask-ai-button';
import { useAuth } from '@/hooks/use-auth';
import { INDIA_STATES } from '@/lib/mission-ias/map-schema';
import { getMapProgress, recordMapAttempt, summarizeMapProgress, type StateProgress } from '@/lib/repositories/mapProgressRepository';
import { awardXp } from '@/lib/gamification/xp-service';
import { cn } from '@/lib/utils';

type MapFeature = Feature<Geometry, { name: string }>;
type Region = 'india' | 'world';
type Mode = 'explore' | 'smart' | 'timed';
type Difficulty = 'foundation' | 'upsc' | 'elite';

const WIDTH = 520;
const HEIGHT = 600;
const PALETTE = ['#7c3aed', '#8b5cf6', '#a855f7', '#9333ea', '#c026d3', '#d946ef', '#6366f1', '#4f46e5'];
const DIFFICULTY: Record<Difficulty, { label: string; desc: string; seconds: number; points: number }> = {
  foundation: { label: 'Foundation', desc: 'Learn the map with generous time.', seconds: 12, points: 5 },
  upsc: { label: 'UPSC', desc: 'Balanced Prelims-style practice.', seconds: 8, points: 10 },
  elite: { label: 'Elite', desc: 'Fast recall + weak-area targeting.', seconds: 5, points: 20 },
};

function normalize(s: string) { return s.trim().toLowerCase(); }
function featureName(f: MapFeature) { return f.properties?.name ?? 'Unknown'; }
function shuffle<T>(items: T[]) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function accuracy(p?: StateProgress) { if (!p) return 0; const n = p.correctCount + p.incorrectCount; return n ? Math.round((p.correctCount / n) * 100) : 0; }

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
  const regionUrl = india ? '/data/india-states.geojson' : '/data/world-countries.geojson';

  useEffect(() => {
    setLoading(true);
    setSelected(null); setTarget(null); setQueue([]); setRoundComplete(false);
    fetch(regionUrl)
      .then(r => r.json())
      .then((data: FeatureCollection<Geometry, { name: string }>) => setFeatures(data.features as MapFeature[]))
      .catch(() => toast.error('Could not load map data'))
      .finally(() => setLoading(false));
  }, [regionUrl]);

  useEffect(() => {
    if (!user || !india) return;
    getMapProgress().then(setProgress).catch(() => undefined);
    try { setLastState(localStorage.getItem('ss_map_last_explored')); } catch { /* ignore */ }
  }, [user, india]);

  const stats = useMemo(() => summarizeMapProgress(progress), [progress]);
  const progressByName = useMemo(() => new Map(progress.map(p => [normalize(p.stateName), p])), [progress]);
  const weakStates = useMemo(() => {
    return [...features].map(f => featureName(f)).filter(n => india).sort((a, b) => {
      const aa = progressByName.get(normalize(a)); const bb = progressByName.get(normalize(b));
      const av = aa ? accuracy(aa) : 0; const bv = bb ? accuracy(bb) : 0;
      const ac = aa ? aa.correctCount + aa.incorrectCount : 0; const bc = bb ? bb.correctCount + bb.incorrectCount : 0;
      return (av - (ac ? 0 : 20)) - (bv - (bc ? 0 : 20));
    }).slice(0, 8);
  }, [features, progressByName, india]);

  const masteredCount = useMemo(() => progress.filter(p => p.correctCount >= 3 && accuracy(p) >= 70).length, [progress]);
  const masteryPct = india && features.length ? Math.round((masteredCount / features.length) * 100) : 0;

  const projection = useMemo(() => {
    if (!features.length) return null;
    return geoMercator().fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features });
  }, [features]);
  const pathGen = useMemo(() => projection ? geoPath(projection) : null, [projection]);

  const startSmart = useCallback(() => {
    if (!features.length) return;
    const names = features.map(featureName);
    const weak = india ? weakStates : names;
    const weighted = shuffle([...weak, ...weak, ...names]);
    setMode('smart'); setScore(0); setAttempted(0); setSessionStreak(0); setFeedback(null); setWrongGuess(null); setRoundComplete(false);
    setQueue(weighted.slice(1)); setTarget(weighted[0]); setSecondsLeft(DIFFICULTY[difficulty].seconds);
  }, [features, weakStates, india, difficulty]);

  const startTimed = useCallback(() => {
    if (!features.length) return;
    const names = shuffle(features.map(featureName));
    setMode('timed'); setScore(0); setAttempted(0); setSessionStreak(0); setFeedback(null); setWrongGuess(null); setRoundComplete(false);
    setQueue(names.slice(1)); setTarget(names[0]); setSecondsLeft(60);
  }, [features]);

  const nextQuestion = useCallback(() => {
    setFeedback(null); setWrongGuess(null);
    if (!queue.length) {
      if (mode === 'timed') {
        const names = shuffle(features.map(featureName));
        setQueue(names.slice(1)); setTarget(names[0]);
      } else {
        setTarget(null); setRoundComplete(true); setSecondsLeft(null); toast.success('Advanced round complete!');
      }
      return;
    }
    setTarget(queue[0]); setQueue(q => q.slice(1));
    if (mode === 'smart') setSecondsLeft(DIFFICULTY[difficulty].seconds);
  }, [queue, mode, features, difficulty]);

  useEffect(() => {
    if (mode !== 'smart' || secondsLeft === null || !target || feedback) return;
    if (secondsLeft <= 0) {
      setAttempted(a => a + 1); setSessionStreak(0); setFeedback('wrong'); setWrongGuess(null);
      if (india && user) void recordMapAttempt(target, false).then(() => getMapProgress().then(setProgress));
      const t = setTimeout(nextQuestion, 550); return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSecondsLeft(s => s === null ? null : s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, secondsLeft, target, feedback, india, user, nextQuestion]);

  useEffect(() => {
    if (mode !== 'timed' || secondsLeft === null) return;
    if (secondsLeft <= 0) { setTarget(null); setRoundComplete(true); return; }
    const t = setTimeout(() => setSecondsLeft(s => s === null ? null : s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, secondsLeft]);

  const choose = useCallback((name: string) => {
    if (mode === 'explore') {
      setSelected(name); setLastState(name);
      if (india) try { localStorage.setItem('ss_map_last_explored', name); } catch { /* ignore */ }
      return;
    }
    if (!target || feedback || (mode === 'timed' && secondsLeft === 0)) return;
    const correct = normalize(name) === normalize(target);
    setAttempted(a => a + 1);
    if (correct) {
      setScore(s => s + (mode === 'smart' ? DIFFICULTY[difficulty].points : 1));
      setSessionStreak(s => s + 1); setFeedback('correct');
      if (india && user) {
        void recordMapAttempt(target, true).then(() => getMapProgress().then(setProgress));
        void awardXp(user.uid, 'mapPracticeCorrect');
      }
      const t = setTimeout(nextQuestion, mode === 'timed' ? 220 : 650); return () => clearTimeout(t);
    }
    setFeedback('wrong'); setWrongGuess(name); setSessionStreak(0);
    if (india && user) void recordMapAttempt(target, false).then(() => getMapProgress().then(setProgress));
    if (mode === 'timed') { const t = setTimeout(nextQuestion, 350); return () => clearTimeout(t); }
  }, [mode, target, feedback, secondsLeft, difficulty, india, user, nextQuestion]);

  const searchMatch = useMemo(() => {
    const q = normalize(search); if (!q || mode !== 'explore') return null;
    return features.find(f => normalize(featureName(f)).includes(q)) ?? null;
  }, [search, mode, features]);
  useEffect(() => { if (searchMatch) setSelected(featureName(searchMatch)); }, [searchMatch]);

  const selectedInfo = useMemo(() => {
    if (!selected || !india) return null;
    return INDIA_STATES.find(s => normalize(s.name) === normalize(selected)) ?? null;
  }, [selected, india]);
  const selectedProgress = selected ? progressByName.get(normalize(selected)) : undefined;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-primary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Advanced Geography Lab</div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl"><MapIcon className="h-7 w-7 text-primary" /> Map Practice</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Adaptive map training built for UPSC Prelims: explore, diagnose weak states, build recall speed, and master the map.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['india', 'world'] as Region[]).map(r => (
              <button key={r} onClick={() => setRegion(r)} className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all', region === r ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground')}>
                {r === 'india' ? <Landmark className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}{r === 'india' ? 'India' : 'World'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {india && user && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ['Accuracy', `${stats.accuracyPct}%`, Target],
            ['Mastery', `${masteryPct}%`, ShieldCheck],
            ['States', `${masteredCount}/${features.length}`, Award],
            ['Weak Areas', `${weakStates.length}`, Brain],
            ['Streak', `${sessionStreak}`, Flame],
          ].map(([label, value, Icon]) => (
            <GlassCard key={String(label)} className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div><p className="mt-1 text-xl font-bold">{value}</p></GlassCard>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2">
        <div className="flex flex-wrap gap-1">
          {([['explore', 'Explore', Compass], ['smart', 'Smart Practice', Brain], ['timed', '60s Sprint', Timer]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => { if (id === 'smart') startSmart(); else if (id === 'timed') startTimed(); else { setMode('explore'); setTarget(null); setSecondsLeft(null); setFeedback(null); } }} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all', mode === id ? 'bg-gradient-brand text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}><Icon className="h-4 w-4" />{label}</button>
          ))}
        </div>
        {mode !== 'explore' && (
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => <button key={d} onClick={() => setDifficulty(d)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', difficulty === d ? 'bg-white/10 text-foreground' : 'text-muted-foreground')}>{DIFFICULTY[d].label}</button>)}
          </div>
        )}
      </div>

      {india && mode === 'smart' && (
        <GlassCard className="border-primary/20 bg-primary/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Adaptive mission</p><p className="mt-1 text-sm">Questions are weighted toward your weakest states. {target ? <>Locate <strong className="text-primary">{target}</strong> on the map.</> : 'Round complete.'}</p></div>
            <div className="flex items-center gap-4 text-sm font-semibold"><span><Trophy className="mr-1 inline h-4 w-4 text-amber-400" />{score} pts</span><span><Flame className="mr-1 inline h-4 w-4 text-orange-400" />{sessionStreak}</span>{secondsLeft !== null && <span className={cn(secondsLeft <= 3 && 'text-red-400')}>{secondsLeft}s</span>}</div>
          </div>
        </GlassCard>
      )}

      {mode === 'timed' && <GlassCard className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{target ? <>Find <span className="text-primary">{target}</span></> : 'Sprint finished'}</p><p className="text-xs text-muted-foreground">Fast recall. Every correct answer keeps your score moving.</p></div><div className="flex items-center gap-4 text-sm font-bold"><span className={cn('rounded-lg px-3 py-1.5', (secondsLeft ?? 0) <= 10 ? 'bg-red-500/15 text-red-300' : 'bg-white/5')}>{secondsLeft ?? 0}s</span><span><Trophy className="mr-1 inline h-4 w-4 text-amber-400" />{score}</span><Button size="sm" variant="outline" onClick={startTimed}><RotateCcw className="h-4 w-4" /> Restart</Button></div></GlassCard>}

      {feedback && mode !== 'explore' && <div className={cn('flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold', feedback === 'correct' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300')}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{feedback === 'correct' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>{feedback === 'correct' ? `Correct! +${mode === 'smart' ? DIFFICULTY[difficulty].points : 1} points.` : `Not quite${wrongGuess ? ` — you clicked ${wrongGuess}` : ''}. The answer is ${target}.`}</div>}

      {mode === 'explore' && <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${india ? 'states and union territories' : 'countries'}...`} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40" /></div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.7fr)]">
        <GlassCard className="relative overflow-hidden p-2 sm:p-4">
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1 rounded-xl border border-white/10 bg-secondary/85 p-1 backdrop-blur">
            <button onClick={() => setZoom(z => Math.min(4, z + .5))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><Plus className="h-4 w-4" /></button>
            <button onClick={() => setZoom(z => Math.max(1, z - .5))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><Minus className="h-4 w-4" /></button>
            <button onClick={() => setZoom(1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><Crosshair className="h-4 w-4" /></button>
          </div>
          {loading ? <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">Loading geography lab...</div> : pathGen ? (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto h-auto max-h-[650px] w-full max-w-[560px]">
              <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
                <defs><filter id="mapGlow"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                {features.map((f, i) => {
                  const name = featureName(f); const p = progressByName.get(normalize(name));
                  const isSelected = mode === 'explore' && selected === name;
                  const isTarget = mode !== 'explore' && target === name;
                  const isWrong = wrongGuess === name;
                  return <path key={`${name}-${i}`} d={pathGen(f) ?? ''} onClick={() => choose(name)} fill={isWrong ? '#ef4444' : feedback === 'correct' && isTarget ? '#22c55e' : PALETTE[i % PALETTE.length]} fillOpacity={isSelected ? .95 : mode !== 'explore' ? .6 : .68} stroke={isSelected || isTarget ? 'white' : 'rgba(255,255,255,.22)'} strokeWidth={isSelected || isTarget ? 1.8 : .55} filter={isSelected || isTarget || isWrong ? 'url(#mapGlow)' : undefined} className="cursor-pointer transition-all duration-200 hover:brightness-125" aria-label={`${name}${p ? `, ${accuracy(p)} percent accuracy` : ''}`}><title>{name}{p ? ` • ${accuracy(p)}% accuracy` : ''}</title></path>;
                })}
              </g>
            </svg>
          ) : null}
        </GlassCard>

        <div className="space-y-3">
          {mode === 'explore' && selected ? <GlassCard className="space-y-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">Selected region</p><h2 className="mt-1 text-xl font-bold">{selected}</h2></div>{selectedProgress && <div className="rounded-xl bg-primary/10 px-3 py-2 text-center"><p className="text-lg font-bold">{accuracy(selectedProgress)}%</p><p className="text-[10px] text-muted-foreground">accuracy</p></div>}</div>
            {selectedInfo && <><div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="mt-1 font-medium">{selectedInfo.type === 'state' ? 'State' : 'Union Territory'}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-muted-foreground">Capital</p><p className="mt-1 font-medium">{selectedInfo.capital}</p></div></div><div><p className="text-xs text-muted-foreground">Borders</p><div className="mt-1 flex flex-wrap gap-1">{selectedInfo.neighbors.map(n => <span key={n} className="rounded-full border border-white/10 px-2 py-1 text-[11px]">{n}</span>)}</div></div><AskAiButton label="UPSC facts & map traps" prompt={`Give me high-yield UPSC Prelims facts about ${selectedInfo.name}: capital, neighbouring states/countries, rivers, physical geography, national parks, borders, and common map-based traps.` /></>}
          </GlassCard> : <GlassCard className="space-y-4"><div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h2 className="font-bold">Adaptive Intelligence</h2></div><p className="text-sm text-muted-foreground">Your next questions should attack weak recall instead of repeating what you already know.</p>{india && user && <div className="space-y-2">{weakStates.slice(0, 5).map((n, i) => { const p = progressByName.get(normalize(n)); return <button key={n} onClick={() => { setMode('explore'); setSelected(n); }} className="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left hover:bg-white/10"><span className="flex items-center gap-2 text-sm"><span className="text-xs text-muted-foreground">#{i + 1}</span>{n}</span><span className="text-xs font-semibold text-primary">{p ? `${accuracy(p)}%` : 'New'}</span></button>; })}</div>}<Button className="w-full bg-gradient-brand" onClick={startSmart}><Brain className="h-4 w-4" /> Start Smart Practice</Button></GlassCard>}

          {india && user && <GlassCard><button onClick={() => setShowMastery(v => !v)} className="flex w-full items-center justify-between"><span className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Mastery Matrix</span><span className="text-xs text-muted-foreground">{showMastery ? 'Hide' : 'View'}</span></button>{showMastery && <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-auto">{features.map(f => { const n = featureName(f); const p = progressByName.get(normalize(n)); const a = accuracy(p); const mastered = p && p.correctCount >= 3 && a >= 70; return <div key={n} className="rounded-lg bg-white/5 p-2"><div className="flex items-center justify-between gap-2 text-[11px]"><span className="truncate">{n}</span><span className={cn('font-bold', mastered ? 'text-emerald-400' : a >= 50 ? 'text-amber-400' : 'text-red-400')}>{p ? `${a}%` : '—'}</span></div><div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, a)}%` }} /></div></div>; })}</div>}</GlassCard>}

          {lastState && <GlassCard className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Continue learning</p><p className="font-semibold">{lastState}</p></div><button onClick={() => { setMode('explore'); setSelected(lastState); }} className="rounded-lg bg-primary/10 p-2 text-primary"><RotateCcw className="h-4 w-4" /></button></GlassCard>}
        </div>
      </div>

      {roundComplete && mode !== 'explore' && <GlassCard className="flex flex-col items-center gap-3 py-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg"><Trophy className="h-7 w-7" /></div><h2 className="text-xl font-bold">Session complete</h2><p className="text-sm text-muted-foreground">{score} points • {attempted ? Math.round((score / attempted) * 100) : 0}% session performance • {sessionStreak} current streak</p><Button onClick={mode === 'smart' ? startSmart : startTimed} className="bg-gradient-brand"><Zap className="h-4 w-4" /> Go again</Button></GlassCard>}
    </div>
  );
}
