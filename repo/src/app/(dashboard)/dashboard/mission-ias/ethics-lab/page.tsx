'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Scale, Sparkles, Loader2, BookOpen, Users, Search, Trophy, History } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subscribeCaseStudySessions, saveCaseStudySession } from '@/lib/mission-ias/ethics-service';
import {
  ETHICS_CONCEPTS, THINKERS,
  type CaseStudy, type CaseStudyFeedback, type CaseStudySession
} from '@/lib/mission-ias/ethics-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';

type Tab = 'case-study' | 'concepts' | 'thinkers';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : score >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-red-400 border-red-500/30 bg-red-500/10';
  return <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', color)}>{score}/100</span>;
}

// ---------------------------------------------------------------------------
// Case Study tab
// ---------------------------------------------------------------------------

function CaseStudyTab({
  uid, sessions
}: {
  uid: string;
  sessions: CaseStudySession[];
}) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<CaseStudyFeedback | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function generateCaseStudy() {
    setGenerating(true);
    setFeedback(null);
    setAnswer('');
    try {
      const res = await fetch('/api/mission-ias/ethics-case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCaseStudy({ scenario: data.scenario, questions: data.questions });
    } catch {
      toast.error('Could not generate a case study. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function submitAnswer() {
    if (!caseStudy) return;
    if (answer.trim().length < 20) {
      toast.error('Write a fuller answer covering all 3 questions.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/mission-ias/ethics-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: caseStudy.scenario, questions: caseStudy.questions, answer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFeedback(data.feedback);
      await saveCaseStudySession(uid, caseStudy.scenario, caseStudy.questions, answer, data.feedback);
      toast.success('+15 XP for completing a case study!');
    } catch {
      toast.error('Could not grade your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + x.feedback.score, 0) / sessions.length) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <GlassCard><p className="text-xs text-muted-foreground">Case Studies Done</p><p className="text-2xl font-bold">{sessions.length}</p></GlassCard>
        <GlassCard><p className="text-xs text-muted-foreground">Average Score</p><p className="text-2xl font-bold">{avgScore ?? '\u2014'}</p></GlassCard>
        <GlassCard>
          <p className="text-xs text-muted-foreground">Topic (optional)</p>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. corruption, environment"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
          />
        </GlassCard>
      </div>

      {!caseStudy ? (
        <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
          <Scale className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">Generate a fresh UPSC GS4-style ethical dilemma and practice writing a full case-study answer.</p>
          <Button onClick={generateCaseStudy} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate Case Study'}
          </Button>
        </GlassCard>
      ) : (
        <GlassCard className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scenario</p>
            <p className="text-sm leading-relaxed">{caseStudy.scenario}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questions</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {caseStudy.questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </div>

          {!feedback ? (
            <div className="space-y-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={10}
                placeholder="Write your full answer covering all 3 questions here..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={submitAnswer} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Grading...' : 'Submit for Feedback'}
                </Button>
                <Button variant="outline" onClick={generateCaseStudy} disabled={generating}>
                  <Sparkles className="h-4 w-4" /> New Case Study
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Feedback</p>
                <ScoreBadge score={feedback.score} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ethical Issues Identified</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {feedback.ethicalIssuesIdentified.map((e) => (
                    <span key={e} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px]">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Options Evaluated</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {feedback.optionsEvaluated.map((o) => (
                    <span key={o} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px]">{o}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-emerald-400">Strengths</p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm">
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs text-amber-400">Improvements</p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm">
                  {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model Approach</p>
                <p className="text-sm leading-relaxed">{feedback.modelApproach}</p>
              </div>
              <Button variant="outline" onClick={() => { setCaseStudy(null); setFeedback(null); }}>
                <Sparkles className="h-4 w-4" /> Try Another Case Study
              </Button>
            </div>
          )}
        </GlassCard>
      )}

      {sessions.length > 0 && (
        <GlassCard className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-semibold"><History className="h-4 w-4" /> Recent Attempts</p>
          {sessions.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between border-t border-white/5 py-2 text-sm first:border-t-0">
              <p className="line-clamp-1 pr-3 text-muted-foreground">{s.scenario}</p>
              <ScoreBadge score={s.feedback.score} />
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Concepts tab
// ---------------------------------------------------------------------------

function ConceptsTab() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ETHICS_CONCEPTS;
    return ETHICS_CONCEPTS.filter((c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GS4 concepts..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
      </div>
      {filtered.map((c) => (
        <GlassCard key={c.id} className="space-y-1.5">
          <h3 className="font-semibold">{c.term}</h3>
          <p className="text-sm text-muted-foreground">{c.definition}</p>
          <p className="text-xs text-primary/80">{c.examRelevance}</p>
        </GlassCard>
      ))}
      {filtered.length === 0 && (
        <GlassCard><p className="text-sm text-muted-foreground">No concepts match your search.</p></GlassCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thinkers tab
// ---------------------------------------------------------------------------

function ThinkersTab() {
  return (
    <div className="space-y-3">
      {THINKERS.map((t) => (
        <GlassCard key={t.id} className="space-y-2">
          <div>
            <h3 className="font-semibold">{t.name}</h3>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.era}</p>
          </div>
          <p className="text-sm text-muted-foreground">{t.coreIdea}</p>
          <p className="border-l-2 border-primary/40 pl-3 text-sm italic">\u201c{t.quote}\u201d</p>
          <p className="text-xs text-primary/80">{t.examRelevance}</p>
          <AskAiButton
            label="More facts for GS4"
            prompt={`Give me more UPSC GS4-relevant facts about ${t.name}'s ethical philosophy, with 2-3 short quotable lines I could use in a Mains answer, and one worked example of applying their theory to a modern administrative dilemma.`}
          />
        </GlassCard>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EthicsLabPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('case-study');
  const [sessions, setSessions] = useState<CaseStudySession[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCaseStudySessions(user.uid, setSessions);
    return () => unsub();
  }, [user]);

  const TABS: { id: Tab; label: string; icon: typeof Scale }[] = [
    { id: 'case-study', label: 'Case Studies', icon: Scale },
    { id: 'concepts', label: 'Concepts', icon: BookOpen },
    { id: 'thinkers', label: 'Thinkers & Quotes', icon: Users }
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Scale className="h-6 w-6 text-primary" /> Ethics Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          GS Paper 4 practice \u2014 case studies with AI feedback, key concepts, and thinkers &amp; quotes.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl bg-secondary p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t.id ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'case-study' && (
        user ? <CaseStudyTab uid={user.uid} sessions={sessions} /> : (
          <GlassCard><p className="text-sm text-muted-foreground">Please log in to practice case studies.</p></GlassCard>
        )
      )}
      {tab === 'concepts' && <ConceptsTab />}
      {tab === 'thinkers' && <ThinkersTab />}
    </div>
  );
}
