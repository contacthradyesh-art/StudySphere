'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, FileText, Play, Search, Sparkles, Target, Bookmark } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';

export type MissionModuleConfig = {
  title: string;
  description: string;
  icon: React.ElementType;
  accent?: string;
  focus: string[];
  actions: string[];
  prompts: string[];
};

export function AdvancedModulePage({ config }: { config: MissionModuleConfig }) {
  const Icon = config.icon;
  const [query, setQuery] = useState('');
  const [done, setDone] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(0);
  const items = useMemo(() => config.prompts.filter((x) => x.toLowerCase().includes(query.toLowerCase())), [config.prompts, query]);

  function toggle(setter: React.Dispatch<React.SetStateAction<Set<number>>>, i: number) {
    setter((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.10] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-6 w-6" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Mission IAS · Advanced Lab</p><h1 className="mt-1 text-2xl font-bold">{config.title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{config.description}</p></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm"><span className="text-muted-foreground">Progress</span><div className="mt-1 text-xl font-bold">{done.size}/{config.prompts.length}</div></div>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-3">
        {config.actions.map((action, i) => <button key={action} onClick={() => setActive(i)} className={`rounded-2xl border p-4 text-left transition ${active === i ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}><div className="flex items-center gap-2 font-semibold"><Play className="h-4 w-4 text-primary" />{action}</div><p className="mt-1 text-xs text-muted-foreground">Focused, exam-oriented practice</p></button>)}
      </div>

      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, questions, concepts..." className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/40" /></div><div className="rounded-xl border border-white/10 px-3 py-2 text-xs text-muted-foreground">{items.length} practice items</div></div>
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((prompt, i) => <GlassCard key={prompt} className="p-5"><div className="flex gap-3"><div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary"><Target className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-primary">{config.focus[i % config.focus.length]}</p><h2 className="mt-1 font-semibold leading-snug">{prompt}</h2><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => toggle(setDone, i)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${done.has(i) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-primary/10 text-primary'}`}><CheckCircle2 className="h-3.5 w-3.5" />{done.has(i) ? 'Completed' : 'Mark done'}</button><button onClick={() => toggle(setSaved, i)} className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs ${saved.has(i) ? 'text-primary' : 'text-muted-foreground'}`}><Bookmark className="h-3.5 w-3.5" />{saved.has(i) ? 'Saved' : 'Save'}</button><span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />10–20 min</span></div></div></div></GlassCard>)}
      </div>

      <GlassCard className="border-primary/15 bg-primary/[0.04] p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">Exam intelligence</p><p className="mt-1 text-sm text-muted-foreground">Connect this module with Notes, Bookmarks and your Mission Analytics. The goal is a closed loop: learn → practice → review → improve.</p></div></div></GlassCard>
    </div>
  );
}
