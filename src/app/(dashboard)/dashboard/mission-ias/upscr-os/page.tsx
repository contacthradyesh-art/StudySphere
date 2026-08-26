'use client';

import Link from 'next/link';
import { BookOpenCheck, Brain, CalendarClock, ChevronRight, FileText, Flame, Lightbulb, Map, MessageCircle, NotebookPen, RefreshCcw, Scale, Search, Target, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';

const sections = [
  { title: 'Learn Hub', desc: 'Concepts, NCERT, GS foundation और syllabus-linked notes', icon: BookOpenCheck, href: '/dashboard/mission-ias/current-affairs' },
  { title: 'PYQ Intelligence', desc: 'विषय, वर्ष, GS paper और trend के अनुसार PYQ practice', icon: Search, href: '/dashboard/mission-ias/pyq-explorer' },
  { title: 'Prelims War Room', desc: 'Timed MCQ, elimination और mistake review', icon: Target, href: '/dashboard/mission-ias/prelims-test-engine' },
  { title: 'Mains Answer Lab', desc: '10/15 marker writing और structured evaluation', icon: NotebookPen, href: '/dashboard/mission-ias/daily-answer-writing' },
  { title: 'Essay Studio', desc: 'Brainstorm → framework → essay → improvement', icon: FileText, href: '/dashboard/mission-ias/essay-lab' },
  { title: 'Ethics Case Lab', desc: 'Case studies, stakeholders और ethical decision making', icon: Scale, href: '/dashboard/mission-ias/ethics-lab' },
  { title: 'Smart Revision', desc: 'Active recall, weak-topic recovery और revision trail', icon: RefreshCcw, href: '/dashboard/mission-ias/revision-engine' },
  { title: 'Map Intelligence', desc: 'Places in news, India/world mapping और map MCQs', icon: Map, href: '/dashboard/mission-ias/map-practice' },
  { title: 'AI IAS Mentor', desc: 'समझाओ, प्रश्न बनाओ, answer check करो, plan बनाओ', icon: Brain, href: '/dashboard/ai' },
  { title: 'Interview Room', desc: 'DAF, current affairs और situational mock interview', icon: MessageCircle, href: '/dashboard/mission-ias/interview-room' },
];

export default function UpscOsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.13] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Trophy className="h-3.5 w-3.5" /> Mission IAS Premium OS
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Learn → Practice → Revise → Test → Analyze</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">UPSC preparation को अलग-अलग tools में बाँटने के बजाय एक continuous learning loop में जोड़ें। जहाँ real user data उपलब्ध नहीं है, वहाँ progress को अनुमान से नहीं दिखाया जाता।</p>
          </div>
          <Link href="/dashboard/planner" className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20"><CalendarClock className="h-4 w-4" /> आज का Mission Plan <ChevronRight className="h-4 w-4" /></Link>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ title, desc, icon: Icon, href }) => (
          <Link key={title} href={href} className="group">
            <GlassCard className="h-full p-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p></div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <GlassCard className="p-5"><div className="mb-2 flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" /><span className="text-sm font-semibold">Daily Mission</span></div><p className="text-xs leading-5 text-muted-foreground">Planner से आज के actual tasks यहाँ लाएँ और पूरा होने पर वही activity progress में reflect होगी।</p></GlassCard>
        <GlassCard className="p-5"><div className="mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Study Loop</span></div><p className="text-xs leading-5 text-muted-foreground">एक topic को Learn, PYQ, MCQ, Mains और Revision से connect करके पढ़ें।</p></GlassCard>
        <GlassCard className="p-5"><div className="mb-2 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-300" /><span className="text-sm font-semibold">Exam Readiness</span></div><p className="text-xs leading-5 text-muted-foreground">Readiness score तभी दिखेगा जब पर्याप्त वास्तविक performance data उपलब्ध होगा।</p></GlassCard>
      </div>
    </div>
  );
}
