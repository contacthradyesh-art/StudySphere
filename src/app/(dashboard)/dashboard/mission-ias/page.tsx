'use client';

import Link from 'next/link';
import { Landmark, Newspaper, BookOpen, FileText, Landmark as GovIcon, TrendingUp, Leaf, Cpu, Globe, Scale, PenTool, ListChecks, Repeat, Mic, Network, Library, BarChart3, Bookmark, Map, Sparkles, Brain, CalendarClock, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';

interface ModuleCard { label: string; icon: React.ElementType; href: string; }
const MODULES: ModuleCard[] = [
  { label: 'दैनिक समसामयिकी', icon: Newspaper, href: '/dashboard/mission-ias/current-affairs' },
  { label: 'प्रेरणा', icon: Sparkles, href: '/dashboard/mission-ias/motivation' },
  { label: 'Editorial Hub', icon: FileText, href: '/dashboard/mission-ias/editorial-hub' },
  { label: 'PIB Hub', icon: GovIcon, href: '/dashboard/mission-ias/pib-hub' },
  { label: 'PRS Hub', icon: BookOpen, href: '/dashboard/mission-ias/prs-hub' },
  { label: 'सरकारी योजनाएँ', icon: GovIcon, href: '/dashboard/mission-ias/government-schemes' },
  { label: 'रिपोर्ट्स एवं सूचकांक', icon: BarChart3, href: '/dashboard/mission-ias/reports-indices' },
  { label: 'बजट एवं अर्थव्यवस्था', icon: TrendingUp, href: '/dashboard/mission-ias/budget-economy' },
  { label: 'पर्यावरण हब', icon: Leaf, href: '/dashboard/mission-ias/environment-hub' },
  { label: 'विज्ञान एवं तकनीक', icon: Cpu, href: '/dashboard/mission-ias/science-tech' },
  { label: 'अंतरराष्ट्रीय संबंध', icon: Globe, href: '/dashboard/mission-ias/international-relations' },
  { label: 'Ethics Lab', icon: Scale, href: '/dashboard/mission-ias/ethics-lab' },
  { label: 'निबंध प्रयोगशाला', icon: PenTool, href: '/dashboard/mission-ias/essay-lab' },
  { label: 'दैनिक उत्तर लेखन', icon: PenTool, href: '/dashboard/mission-ias/daily-answer-writing' },
  { label: 'PYQ एक्सप्लोरर', icon: ListChecks, href: '/dashboard/mission-ias/pyq-explorer' },
  { label: 'प्रीलिम्स टेस्ट इंजन', icon: ListChecks, href: '/dashboard/mission-ias/prelims-test-engine' },
  { label: 'स्मार्ट रिवीजन', icon: Repeat, href: '/dashboard/mission-ias/revision-engine' },
  { label: 'इंटरव्यू रूम', icon: Mic, href: '/dashboard/mission-ias/interview-room' },
  { label: 'ज्ञान ग्राफ', icon: Network, href: '/dashboard/mission-ias/knowledge-graph' },
  { label: 'डिजिटल लाइब्रेरी', icon: Library, href: '/dashboard/mission-ias/digital-library' },
  { label: 'Mission Analytics', icon: BarChart3, href: '/dashboard/mission-ias/mission-analytics' },
  { label: 'Bookmarks', icon: Bookmark, href: '/dashboard/mission-ias/bookmarks' },
  { label: 'Map Practice', icon: Map, href: '/dashboard/mission-ias/map-practice' },
];

export default function MissionIasDashboardPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.12] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Landmark className="h-6 w-6" /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Mission IAS · हिंदी UPSC OS</p>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">PREMIUM READY</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">एक जगह पढ़ें, अभ्यास करें, दोहराएँ और सुधारें।</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Prelims → Mains → Interview को Current Affairs, PYQ, Answer Writing, Revision, Library, Planner और Analytics से जोड़कर एक continuous learning loop बनाएं।</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/dashboard/mission-ias/upscr-os" className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20"><Trophy className="h-4 w-4" /> Premium OS</Link>
            <Link href="/dashboard/planner" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold hover:bg-white/[0.08]"><CalendarClock className="h-4 w-4" /> आज का Plan</Link>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/dashboard/mission-ias/upscr-os"><GlassCard className="p-5 transition hover:border-primary/30"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/12 p-2 text-primary"><Brain className="h-5 w-5" /></div><div><p className="text-sm font-semibold">AI IAS Mentor</p><p className="text-xs text-muted-foreground">समझाएँ, प्रश्न बनाएँ, practice करें</p></div></div></GlassCard></Link>
        <Link href="/dashboard/planner"><GlassCard className="p-5 transition hover:border-primary/30"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300"><CalendarClock className="h-5 w-5" /></div><div><p className="text-sm font-semibold">Daily Mission</p><p className="text-xs text-muted-foreground">Mission IAS tasks को Planner से जोड़ें</p></div></div></GlassCard></Link>
        <Link href="/dashboard/mission-ias/mission-analytics"><GlassCard className="p-5 transition hover:border-primary/30"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-300/10 p-2 text-amber-200"><Trophy className="h-5 w-5" /></div><div><p className="text-sm font-semibold">Exam Readiness</p><p className="text-xs text-muted-foreground">Real performance data आधारित analysis</p></div></div></GlassCard></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MODULES.map((m) => (
          <Link key={m.label} href={m.href}>
            <div className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-white/[0.03] p-5 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.07]">
              <m.icon className="h-6 w-6 text-primary transition group-hover:scale-105" />
              <span className="text-sm font-medium">{m.label}</span>
              <span className="text-[10px] text-emerald-400">● Live workspace →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
