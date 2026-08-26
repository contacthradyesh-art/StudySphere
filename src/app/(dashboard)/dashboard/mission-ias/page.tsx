'use client';

import Link from 'next/link';
import { Landmark, Newspaper, BookOpen, FileText, Landmark as GovIcon, TrendingUp, Leaf, Cpu, Globe, Scale, PenTool, ListChecks, Repeat, Mic, Network, Library, BarChart3, Bookmark, Map, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';

interface ModuleCard { label: string; icon: React.ElementType; href: string; }

const MODULES: ModuleCard[] = [
  { label: 'Current Affairs', icon: Newspaper, href: '/dashboard/mission-ias/current-affairs' },
  { label: 'Motivation', icon: Sparkles, href: '/dashboard/mission-ias/motivation' },
  { label: 'Editorial Hub', icon: FileText, href: '/dashboard/mission-ias/editorial-hub' },
  { label: 'PIB Hub', icon: GovIcon, href: '/dashboard/mission-ias/pib-hub' },
  { label: 'PRS Hub', icon: BookOpen, href: '/dashboard/mission-ias/prs-hub' },
  { label: 'Government Schemes', icon: GovIcon, href: '/dashboard/mission-ias/government-schemes' },
  { label: 'Reports & Indices', icon: BarChart3, href: '/dashboard/mission-ias/reports-indices' },
  { label: 'Budget & Economy', icon: TrendingUp, href: '/dashboard/mission-ias/budget-economy' },
  { label: 'Environment Hub', icon: Leaf, href: '/dashboard/mission-ias/environment-hub' },
  { label: 'Science & Technology', icon: Cpu, href: '/dashboard/mission-ias/science-tech' },
  { label: 'International Relations', icon: Globe, href: '/dashboard/mission-ias/international-relations' },
  { label: 'Ethics Lab', icon: Scale, href: '/dashboard/mission-ias/ethics-lab' },
  { label: 'Essay Lab', icon: PenTool, href: '/dashboard/mission-ias/essay-lab' },
  { label: 'Daily Answer Writing', icon: PenTool, href: '/dashboard/mission-ias/daily-answer-writing' },
  { label: 'PYQ Explorer', icon: ListChecks, href: '/dashboard/mission-ias/pyq-explorer' },
  { label: 'Prelims Test Engine', icon: ListChecks, href: '/dashboard/mission-ias/prelims-test-engine' },
  { label: 'Revision Engine', icon: Repeat, href: '/dashboard/mission-ias/revision-engine' },
  { label: 'Interview Room', icon: Mic, href: '/dashboard/mission-ias/interview-room' },
  { label: 'Knowledge Graph', icon: Network, href: '/dashboard/mission-ias/knowledge-graph' },
  { label: 'Digital Library', icon: Library, href: '/dashboard/mission-ias/digital-library' },
  { label: 'Mission Analytics', icon: BarChart3, href: '/dashboard/mission-ias/mission-analytics' },
  { label: 'Bookmarks', icon: Bookmark, href: '/dashboard/mission-ias/bookmarks' },
  { label: 'Map Practice', icon: Map, href: '/dashboard/mission-ias/map-practice' },
];

export default function MissionIasDashboardPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.10] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Landmark className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Mission IAS · UPSC Operating System</p><h1 className="text-2xl font-bold">One place to learn, practice, revise and improve.</h1><p className="mt-1 text-sm text-muted-foreground">Prelims → Mains → Interview, connected to Current Affairs, Notes, Library and Analytics.</p></div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center"><div className="text-2xl font-bold">{MODULES.length}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live modules</div></div>
        </div>
      </GlassCard>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MODULES.map((m) => { const Icon = m.icon; return <Link key={m.label} href={m.href}><div className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-white/[0.03] p-5 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.07]"><Icon className="h-6 w-6 text-primary transition group-hover:scale-105" /><span className="text-sm font-medium">{m.label}</span><span className="text-[10px] text-muted-foreground">Open workspace →</span></div></Link>; })}
      </div>
    </div>
  );
}
