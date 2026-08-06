'use client';

import Link from 'next/link';
import {
  Landmark, Newspaper, BookOpen, FileText, Landmark as GovIcon, TrendingUp,
  Leaf, Cpu, Globe, Scale, PenTool, ListChecks, Repeat, Languages, Mic,
  Network, Library, BarChart3, Bookmark, Map
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';

interface ModuleCard {
  label: string;
  icon: React.ElementType;
  href?: string; // present only when the module is actually built
}

// The full module map from the Mission IAS spec. Only entries with an
// `href` are real, working features today — everything else renders as a
// disabled "Coming soon" card so the intended architecture is visible
// without pretending unbuilt features exist.
const MODULES: ModuleCard[] = [
  { label: 'Current Affairs', icon: Newspaper, href: '/dashboard/mission-ias/current-affairs' },
  { label: 'Editorial Hub', icon: FileText },
  { label: 'PIB Hub', icon: GovIcon },
  { label: 'PRS Hub', icon: BookOpen },
  { label: 'Government Schemes', icon: GovIcon },
  { label: 'Reports & Indices', icon: BarChart3 },
  { label: 'Budget & Economy', icon: TrendingUp },
  { label: 'Environment Hub', icon: Leaf },
  { label: 'Science & Technology', icon: Cpu },
  { label: 'International Relations', icon: Globe },
  { label: 'Ethics Lab', icon: Scale, href: '/dashboard/mission-ias/ethics-lab' },
  { label: 'Essay Lab', icon: PenTool },
  { label: 'Daily Answer Writing', icon: PenTool },
  { label: 'PYQ Explorer', icon: ListChecks },
  { label: 'Prelims Test Engine', icon: ListChecks },
  { label: 'Revision Engine', icon: Repeat },
  { label: 'Vocabulary Lab', icon: Languages, href: '/dashboard/mission-ias/vocabulary-lab' },
  { label: 'Interview Room', icon: Mic },
  { label: 'Knowledge Graph', icon: Network },
  { label: 'Digital Library', icon: Library, href: '/dashboard/mission-ias/digital-library' },
  { label: 'Mission Analytics', icon: BarChart3 },
  { label: 'Bookmarks', icon: Bookmark },
  { label: 'Map Practice', icon: Map, href: '/dashboard/mission-ias/map-practice' },
];

export default function MissionIasDashboardPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Landmark className="h-6 w-6 text-primary" /> Mission IAS
        </h1>
        <p className="text-sm text-muted-foreground">
          Your UPSC preparation operating system inside StudySphere. Built as a set of modules that reuse
          the existing Planner, Notes, Flashcards, XP and AI Assistant — never duplicated.
        </p>
      </div>

      <GlassCard className="border-primary/20 bg-primary/5">
        <p className="text-sm">
          🚧 <span className="font-medium">Phase 1 of many.</span> Only <strong>Current Affairs</strong> is live
          right now. Every other module below is planned and will plug into this same architecture
          (see the sub-navigation bar above) as it's built, one phase at a time.
        </p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const card = (
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center transition-colors',
                m.href
                  ? 'border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer'
                  : 'border-white/10 bg-white/5 text-muted-foreground/50 cursor-not-allowed'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{m.label}</span>
              {!m.href && <span className="text-[10px]">Coming soon</span>}
            </div>
          );
          return m.href ? <Link key={m.label} href={m.href}>{card}</Link> : <div key={m.label}>{card}</div>;
        })}
      </div>
    </div>
  );
}