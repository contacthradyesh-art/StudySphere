'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import { Map, Target, Compass, RotateCcw, Trophy, Globe2, Landmark, Search, ZoomIn, ZoomOut, Maximize2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INDIA_STATES } from '@/lib/mission-ias/map-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';

type MapFeature = Feature<Geometry, Record<string, unknown>>;
type Region = 'india' | 'world';

const WIDTH = 500;
const HEIGHT = 600;
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;

const REGIONS: { id: Region; label: string; icon: typeof Landmark; dataUrl: string; visitedKey: string }[] = [
  { id: 'india', label: 'India', icon: Landmark, dataUrl: '/data/india-states.geojson', visitedKey: 'mapPractice:visited:india' },
  { id: 'world', label: 'World', icon: Globe2, dataUrl: '/data/world-countries.geojson', visitedKey: 'mapPractice:visited:world' }
];

function getFeatureName(props: Record<string, unknown> | undefined | null): string {
  if (!props) return 'Unknown';
  return String(props.name ?? props.st_nm ?? props.NAME_1 ?? props.State_Name ?? 'Unknown');
}

function getFeatureFlag(props: Record<string, unknown> | undefined | null): string | null {
  const iso = props?.['ISO3166-1-Alpha-2'];
  if (typeof iso !== 'string' || iso.length !== 2 || iso === '-9') return null;
  const codePoints = [...iso.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
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

function loadVisited(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function MapPracticePage() {
  const [region, setRegion] = useState<Region>('india');
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'explore' | 'identify'>('explore');
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const [queue, setQueue] = useState<string[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [wrongState, setWrongState] = useState<string | null>(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const regionConfig = REGIONS.find((r) => r.id === region)!;

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    setMode('explore');
    setTarget(null);
    setQueue([]);
    setSearch('');
    setTransform({ x: 0, y: 0, k: 1 });
    setVisited(loadVisited(regionConfig.visitedKey));
    fetch(regionConfig.dataUrl)
      .then((r) => r.json())
      .then((data: FeatureCollection) => {
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

  const allNames = useMemo(
    () => features.map((f) => getFeatureName(f.properties)).filter((n) => n !== 'Unknown').sort(),
    [features]
  );

  const filteredNames = useMemo(() => {
    if (!search.trim()) return allNames;
    const q = search.trim().toLowerCase();
    return allNames.filter((n) => n.toLowerCase().includes(q));
  }, [allNames, search]);

  const stateInfo = useCallback(
    (name: string) => INDIA_STATES.find((s) => normalizeName(s.name) === normalizeName(name)),
    []
  );

  function markVisited(name: string) {
    setVisited((prev) => {
      if (prev.has(name)) return prev;
      const next = new Set(prev).add(name);
      try {
        window.localStorage.setItem(regionConfig.visitedKey, JSON.stringify([...next]));
      } catch {
        // best-effort only
      }
      return next;
    });
  }

  const startIdentifyRound = useCallback((q: string[]) => {
    if (q.length === 0) {
      toast.success('Round complete!');
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
    startIdentifyRound(shuffle(allNames));
  }

  function selectFeature(name: string) {
    setSelected(name);
    markVisited(name);
  }

  function handleFeatureClick(name: string) {
    if (dragRef.current?.moved) return;
    if (mode === 'explore') {
      selectFeature(name);
      return;
    }
    if (!target || feedback) return;
    setAttempted((a) => a + 1);
    if (name === target) {
      setScore((s) => s + 1);
      setFeedback('correct');
      markVisited(name);
      const nextQueue = queue;
      setTimeout(() => startIdentifyRound(nextQueue), 700);
    } else {
      setFeedback('wrong');
      setWrongState(name);
      toast.error(`That's ${name} \u2014 looking for ${target}`);
    }
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setTransform((t) => ({ ...t, k: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.k + delta * t.k)) }));
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    dragRef.current = { startX: e.clientX - transform.x, startY: e.clientY - transform.y, moved: false };
  }
  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - (dragRef.current.startX + transform.x);
    const dy = e.clientY - (dragRef.current.startY + transform.y);
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    if (dragRef.current.moved) {
      setTransform((t) => ({ ...t, x: e.clientX - dragRef.current!.startX, y: e.clientY - dragRef.current!.startY }));
    }
  }
  function handlePointerUp() {
    setTimeout(() => { dragRef.current = null; }, 0);
  }

  function zoomBy(factor: number) {
    setTransform((t) => ({ ...t, k: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.k * factor)) }));
  }
  function resetView() {
    setTransform({ x: 0, y: 0, k: 1 });
  }

  const info = selected ? stateInfo(selected) : null;
  const selectedFeature = selected ? features.find((f) => getFeatureName(f.properties) === selected) : null;
  const selectedFlag = selectedFeature ? getFeatureFlag(selectedFeature.properties) : null;
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
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium text-foreground">{visited.size}</span> / {allNames.length || '\u2026'} explored
        </div>
        {mode === 'identify' && (
          <span className="flex items-center gap-1 text-sm font-semibold">
            <Trophy className="h-4 w-4 text-amber-400" /> {score}/{attempted}
          </span>
        )}
      </div>

      {mode === 'identify' && target && (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Click on: <span className="font-semibold text-primary">{target}</span>
          </p>
          <Button variant="outline" size="sm" onClick={startIdentifyMode}>
            <RotateCcw className="h-3.5 w-3.5" /> Restart
          </Button>
        </GlassCard>
      )}
      {mode === 'identify' && !target && (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Round complete \u2014 tap Restart to play again.</p>
          <Button variant="outline" size="sm" onClick={startIdentifyMode}>
            <RotateCcw className="h-3.5 w-3.5" /> Restart
          </Button>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="relative lg:col-span-2">
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
            <button onClick={() => zoomBy(1.4)} className="rounded-lg border border-white/10 bg-secondary/80 p-1.5 backdrop-blur hover:bg-secondary">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => zoomBy(1 / 1.4)} className="rounded-lg border border-white/10 bg-secondary/80 p-1.5 backdrop-blur hover:bg-secondary">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={resetView} className="rounded-lg border border-white/10 bg-secondary/80 p-1.5 backdrop-blur hover:bg-secondary">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading map...</p>
          ) : pathGen ? (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="mx-auto w-full max-w-md cursor-grab touch-none active:cursor-grabbing"
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                {features.map((f, i) => {
                  const name = getFeatureName(f.properties);
                  const isSelected = mode === 'explore' && selected === name;
                  const isVisited = visited.has(name);
                  const isWrong = mode === 'identify' && wrongState === name;
                  const isCorrectReveal = mode === 'identify' && feedback === 'correct' && target === name;
                  return (
                    <path
                      key={`${name}-${i}`}
                      d={pathGen(f) ?? ''}
                      onClick={() => handleFeatureClick(name)}
                      className={cn(
                        'cursor-pointer stroke-white/20 [stroke-width:0.4px] transition-colors',
                        isSelected && 'fill-primary',
                        isWrong && 'fill-red-500/70',
                        isCorrectReveal && 'fill-emerald-500/70',
                        !isSelected && !isWrong && !isCorrectReveal && isVisited && 'fill-primary/25 hover:fill-primary/40',
                        !isSelected && !isWrong && !isCorrectReveal && !isVisited && 'fill-white/10 hover:fill-primary/30'
                      )}
                    >
                      <title>{name}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
          ) : null}
        </GlassCard>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {mode === 'explore' && region === 'india' && (
              <motion.div key={selected ?? 'empty-india'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {info ? (
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
                            <button
                              key={n}
                              onClick={() => selectFeature(n)}
                              className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] hover:border-primary hover:text-primary"
                            >
                              {n}
                            </button>
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
                  <GlassCard><p className="text-sm text-muted-foreground">Click any state or union territory on the map, or search the list below.</p></GlassCard>
                )}
              </motion.div>
            )}

            {mode === 'explore' && region === 'world' && (
              <motion.div key={selected ?? 'empty-world'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {selected ? (
                  <GlassCard className="space-y-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      {selectedFlag && <span className="text-2xl">{selectedFlag}</span>} {selected}
                    </h2>
                    <AskAiButton
                      label="Facts about this country"
                      prompt={`Give me the most useful facts about ${selected} for UPSC International Relations \u2014 capital, geography, its relationship with India, and any current-affairs relevance.`}
                    />
                  </GlassCard>
                ) : (
                  <GlassCard><p className="text-sm text-muted-foreground">Click any country on the map, or search the list below.</p></GlassCard>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'identify' && (
            <GlassCard>
              <p className="text-sm text-muted-foreground">
                A name is shown above \u2014 click it on the map. Complete all {allNames.length} to finish a round.
              </p>
            </GlassCard>
          )}

          {mode === 'explore' && (
            <GlassCard className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${unitLabel}...`}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-64 space-y-0.5 overflow-y-auto">
                {filteredNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => selectFeature(name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                      selected === name ? 'bg-primary/15 text-primary' : 'hover:bg-white/5'
                    )}
                  >
                    <span>{name}</span>
                    {visited.has(name) && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                ))}
                {filteredNames.length === 0 && (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches.</p>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}